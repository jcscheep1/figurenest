import assert from "node:assert/strict";
import test from "node:test";
import { parseContactSubmission } from "./contact";

const valid = {
  name: "Local Tester",
  email: "tester@example.test",
  reason: "Bug report",
  pageUrl: "https://figurenest.com/calculators/finance/loan/",
  message: "The displayed result differs from the expected result.",
  website: "",
  startedAt: Date.now() - 5_000,
};

test("contact validation accepts a complete safe submission", () => {
  assert.deepEqual(parseContactSubmission(valid), valid);
});

test("contact validation rejects invalid fields and honeypot input", () => {
  assert.equal(parseContactSubmission({ ...valid, email: "invalid" }), null);
  assert.equal(parseContactSubmission({ ...valid, message: "Too short" }), null);
  assert.equal(parseContactSubmission({ ...valid, website: "spam.example" }), null);
  assert.equal(parseContactSubmission({ ...valid, reason: "Other" }), null);
});