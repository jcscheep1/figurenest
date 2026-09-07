import { createServer, type RequestListener } from "node:http";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

let applicationHandler: RequestListener | undefined;

const server = createServer((req, res) => {
  if (applicationHandler) {
    applicationHandler(req, res);
    return;
  }

  if (req.url === "/api" || req.url === "/api/healthz") {
    res.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    });
    res.end('{"status":"starting"}');
    return;
  }

  res.writeHead(503, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Retry-After": "1",
  });
  res.end('{"error":"Service starting"}');
});

server.on("error", (error) => {
  console.error("Error listening on API port", error);
  process.exit(1);
});

server.listen(port, () => {
  console.info(`API port ${port} open; loading application`);

  void Promise.all([
    import("./app"),
    import("./lib/logger"),
  ]).then(([{ default: app }, { logger }]) => {
    applicationHandler = app as RequestListener;
    logger.info({ port }, "Server ready");
  }).catch((error: unknown) => {
    console.error("API application failed to initialize", error);
    server.close(() => process.exit(1));
    server.closeAllConnections();
    setTimeout(() => process.exit(1), 1_000).unref();
  });
});
