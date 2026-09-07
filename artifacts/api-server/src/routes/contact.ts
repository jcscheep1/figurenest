import { Router, type IRouter, type RequestHandler } from "express";
import { db, contactSubmissionsTable } from "@workspace/db";

const reasons = [
  "General question",
  "Calculator correction",
  "Bug report",
  "Privacy request",
  "Calculator suggestion",
] as const;

type ContactInput = {
  name: string;
  email: string;
  reason: (typeof reasons)[number];
  pageUrl?: string;
  message: string;
  website: string;
  startedAt: number;
};

export function parseContactSubmission(value: unknown): ContactInput | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const reason = typeof input.reason === "string" ? input.reason : "";
  const pageUrl = typeof input.pageUrl === "string" ? input.pageUrl.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  const website = typeof input.website === "string" ? input.website : "";
  const startedAt = input.startedAt;
  if (
    name.length < 2 || name.length > 100
    || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !reasons.includes(reason as ContactInput["reason"])
    || pageUrl.length > 500
    || (pageUrl !== "" && !/^https?:\/\/\S+$/i.test(pageUrl))
    || message.length < 20 || message.length > 5000
    || website !== ""
    || typeof startedAt !== "number" || !Number.isInteger(startedAt) || startedAt <= 0
  ) return null;
  return { name, email, reason: reason as ContactInput["reason"], pageUrl, message, website, startedAt };
}

const CONTACT_WINDOW_MS = 60 * 60 * 1000;
const CONTACT_MAX_PER_WINDOW = 5;
const contactBuckets = new Map<string, { count: number; resetAt: number }>();

const contactRateLimit: RequestHandler = (req, res, next) => {
  const now = Date.now();
  const key = req.ip ?? "unknown";
  const current = contactBuckets.get(key);
  if (!current || current.resetAt <= now) {
    contactBuckets.set(key, { count: 1, resetAt: now + CONTACT_WINDOW_MS });
    next();
    return;
  }
  current.count += 1;
  if (current.count > CONTACT_MAX_PER_WINDOW) {
    res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
    res.status(429).json({ error: "Too many messages. Please try again later." });
    return;
  }
  next();
};

export const contactRouter: IRouter = Router();

contactRouter.post("/contact", contactRateLimit, async (req, res) => {
  const parsed = parseContactSubmission(req.body);
  if (!parsed) {
    res.status(400).json({ error: "Please check the highlighted fields and try again." });
    return;
  }
  const { website, startedAt, pageUrl, ...submission } = parsed;
  if (website || Date.now() - startedAt < 2_000 || Date.now() - startedAt > 24 * 60 * 60 * 1000) {
    res.status(400).json({ error: "Unable to accept this message. Please reload the page and try again." });
    return;
  }
  await db.insert(contactSubmissionsTable).values({
    ...submission,
    pageUrl: pageUrl || null,
  });
  res.status(201).json({ ok: true });
});