import assert from "node:assert/strict";
import test from "node:test";
import { ownerEmailMatches } from "./requireOwner";

test("owner allowlist requires an exact normalized primary email match", () => {
  assert.equal(ownerEmailMatches(" Owner@Example.com ", "owner@example.com"), true);
  assert.equal(ownerEmailMatches("owner@example.com", "other@example.com"), false);
  assert.equal(ownerEmailMatches(undefined, "owner@example.com"), false);
  assert.equal(ownerEmailMatches("owner@example.com", undefined), false);
});