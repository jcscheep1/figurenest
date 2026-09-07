import nodemailer from "nodemailer";

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

function parseContactSubmission(value: unknown): ContactInput | null {
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
    name.length < 2 ||
    name.length > 100 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !reasons.includes(reason as ContactInput["reason"]) ||
    pageUrl.length > 500 ||
    (pageUrl !== "" && !/^https?:\/\/\S+$/i.test(pageUrl)) ||
    message.length < 20 ||
    message.length > 5000 ||
    website !== "" ||
    typeof startedAt !== "number" ||
    !Number.isInteger(startedAt) ||
    startedAt <= 0
  ) {
    return null;
  }

  return {
    name,
    email,
    reason: reason as ContactInput["reason"],
    pageUrl,
    message,
    website,
    startedAt,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const buckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: any) {
  const forwarded = request.headers?.["x-forwarded-for"];

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  return "unknown";
}

function rateLimited(ip: string) {
  const now = Date.now();
  const current = buckets.get(ip);

  if (!current || current.resetAt <= now) {
    buckets.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return false;
  }

  current.count += 1;
  return current.count > MAX_PER_WINDOW;
}

export default async function handler(request: any, response: any) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({
      error: "Method not allowed.",
    });
  }

  const ip = getClientIp(request);

  if (rateLimited(ip)) {
    return response.status(429).json({
      error: "Too many messages. Please try again later.",
    });
  }

  const parsed = parseContactSubmission(request.body);

  if (!parsed) {
    return response.status(400).json({
      error: "Please check the highlighted fields and try again.",
    });
  }

  const elapsed = Date.now() - parsed.startedAt;

  if (
    parsed.website ||
    elapsed < 2000 ||
    elapsed > 24 * 60 * 60 * 1000
  ) {
    return response.status(400).json({
      error:
        "Unable to accept this message. Please reload the page and try again.",
    });
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_APP_PASSWORD;
  const destination = process.env.CONTACT_TO_EMAIL;

  if (!smtpUser || !smtpPassword || !destination) {
    console.error("FigureNest contact mail environment is incomplete.");

    return response.status(503).json({
      error: "Contact service is temporarily unavailable. Please try again later.",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const safeName = escapeHtml(parsed.name);
    const safeEmail = escapeHtml(parsed.email);
    const safeReason = escapeHtml(parsed.reason);
    const safePage = escapeHtml(parsed.pageUrl || "Not supplied");
    const safeMessage = escapeHtml(parsed.message).replaceAll("\n", "<br>");

    await transporter.sendMail({
      from: `"FigureNest Contact" <${smtpUser}>`,
      to: destination,
      replyTo: parsed.email,
      subject: `FigureNest: ${parsed.reason}`,
      text: [
        "New FigureNest contact submission",
        "",
        `Name: ${parsed.name}`,
        `Email: ${parsed.email}`,
        `Reason: ${parsed.reason}`,
        `Page: ${parsed.pageUrl || "Not supplied"}`,
        "",
        parsed.message,
      ].join("\n"),
      html: `
        <h2>New FigureNest contact submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Reason:</strong> ${safeReason}</p>
        <p><strong>Page:</strong> ${safePage}</p>
        <hr>
        <p>${safeMessage}</p>
      `,
    });

    return response.status(201).json({ ok: true });
  } catch (error) {
    console.error("FigureNest contact delivery failed.", error);

    return response.status(502).json({
      error: "Your message could not be sent. Please try again later.",
    });
  }
}
