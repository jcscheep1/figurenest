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
    name.length < 2 || name.length > 100 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !reasons.includes(reason as ContactInput["reason"]) ||
    pageUrl.length > 500 ||
    (pageUrl !== "" && !/^https?:\/\/\S+$/i.test(pageUrl)) ||
    message.length < 20 || message.length > 5000 ||
    website !== "" ||
    typeof startedAt !== "number" ||
    !Number.isInteger(startedAt) ||
    startedAt <= 0
  ) return null;

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

export default async function handler(request: any, response: any) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const parsed = parseContactSubmission(request.body);

  if (!parsed) {
    return response.status(400).json({
      error: "Please check the highlighted fields and try again.",
    });
  }

  if (
    parsed.website ||
    Date.now() - parsed.startedAt < 2000 ||
    Date.now() - parsed.startedAt > 24 * 60 * 60 * 1000
  ) {
    return response.status(400).json({
      error: "Unable to accept this message. Please reload the page and try again.",
    });
  }

  /*
   * Vercel migration stage:
   * Validation and anti-bot checks are active.
   * Permanent submission storage will be connected before DNS cutover.
   */
  return response.status(503).json({
    error: "Contact submissions are temporarily unavailable during migration.",
  });
}
