import express, { type Express, type RequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

const app: Express = express();
const BODY_LIMIT = "32kb";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 240;
const MAX_RATE_LIMIT_CLIENTS = 10_000;
const ADMIN_RATE_LIMIT_MAX_REQUESTS = 60;

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();
const adminRateLimitBuckets = new Map<string, RateLimitBucket>();

app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "private, no-store");
  next();
});

function addAllowedOrigin(origins: Set<string>, value: string | undefined): void {
  if (!value) {
    return;
  }

  for (const candidate of value.split(/[,\s]+/)) {
    if (!candidate) {
      continue;
    }

    try {
      const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
      if (url.protocol === "http:" || url.protocol === "https:") {
        origins.add(url.origin);
      }
    } catch {
      // Ignore malformed configuration values rather than broadening CORS.
    }
  }
}

function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>([
    "https://figurenest.com",
    "https://www.figurenest.com",
  ]);

  // Replit supplies these domains for the current project in development/preview.
  addAllowedOrigin(origins, process.env.REPLIT_DEV_DOMAIN);
  addAllowedOrigin(origins, process.env.REPLIT_DOMAINS);
  // Additional verified custom domains can be explicitly configured at deployment.
  addAllowedOrigin(origins, process.env.CORS_ALLOWED_ORIGINS);

  return origins;
}

const allowedOrigins = getAllowedOrigins();
const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const rateLimit: RequestHandler = (req, res, next) => {
  // Health probes and CORS preflights should not consume a public client's quota.
  if (req.path === "/api/healthz" || req.method === "OPTIONS") {
    next();
    return;
  }

  const now = Date.now();
  let clientKey = req.ip ?? "unknown";
  let current = rateLimitBuckets.get(clientKey);

  if (!current || current.resetAt <= now) {
    if (!current && rateLimitBuckets.size >= MAX_RATE_LIMIT_CLIENTS) {
      for (const [key, bucket] of rateLimitBuckets) {
        if (bucket.resetAt <= now) {
          rateLimitBuckets.delete(key);
        }
      }

      if (rateLimitBuckets.size >= MAX_RATE_LIMIT_CLIENTS) {
        clientKey = "__overflow__";
        current = rateLimitBuckets.get(clientKey);
      }
    }

    if (!current || current.resetAt <= now) {
      const bucket = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
      rateLimitBuckets.set(clientKey, bucket);
      res.setHeader("RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS);
      res.setHeader("RateLimit-Remaining", RATE_LIMIT_MAX_REQUESTS - bucket.count);
      res.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1000));
      next();
      return;
    }
  }

  current.count += 1;
  res.setHeader("RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS);
  res.setHeader("RateLimit-Remaining", Math.max(0, RATE_LIMIT_MAX_REQUESTS - current.count));
  res.setHeader("RateLimit-Reset", Math.ceil(current.resetAt / 1000));

  if (current.count > RATE_LIMIT_MAX_REQUESTS) {
    res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
    res.status(429).json({ error: "Too many requests" });
    return;
  }

  next();
};

const adminRateLimit: RequestHandler = (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
    return;
  }
  const now = Date.now();
  const key = req.ip ?? "unknown";
  const current = adminRateLimitBuckets.get(key);
  if (!current || current.resetAt <= now) {
    adminRateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }
  current.count += 1;
  if (current.count > ADMIN_RATE_LIMIT_MAX_REQUESTS) {
    res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
    res.status(429).json({ error: "Too many Control Center requests" });
    return;
  }
  next();
};

app.disable("x-powered-by");
// The service is behind one Replit proxy in deployed/preview environments.
app.set("trust proxy", 1);

app.use((_req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
  res.setHeader("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Download-Options", "noopen");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");

  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  next();
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin && mutationMethods.has(req.method) && !allowedOrigins.has(origin)) {
    res.status(403).json({ error: "Origin is not allowed" });
    return;
  }
  next();
});
app.use(cors({
  origin(origin, callback) {
    // Requests without Origin (health probes, curl, server-to-server) remain public.
    callback(null, !origin || allowedOrigins.has(origin));
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 204,
  maxAge: 86_400,
}));
app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);
app.use(rateLimit);
app.use("/api/control", adminRateLimit);
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

app.use("/api", router);

app.use(((error, req, res, _next) => {
  req.log.warn({ err: error }, "request validation or handler failed");
  if (typeof error === "object" && error !== null && "issues" in error) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  res.status(500).json({ error: "Internal server error" });
}) as express.ErrorRequestHandler);

export default app;
