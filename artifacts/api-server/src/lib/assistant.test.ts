import assert from "node:assert/strict";
import test from "node:test";
import { advisoryMessage, parseAssistantCommand } from "./assistant";

test("destructive and integration commands always require approval", () => {
  assert.equal(parseAssistantCommand("Publish the latest calculator"), "approval_required");
  assert.equal(parseAssistantCommand("Connect Search Console"), "approval_required");
  assert.equal(parseAssistantCommand("Delete this project"), "approval_required");
  assert.equal(advisoryMessage("approval_required").available, false);
});

test("unavailable facts are reported explicitly", () => {
  assert.equal(parseAssistantCommand("Show project revenue"), "revenue");
  assert.match(advisoryMessage("revenue").message, /unavailable/i);
  assert.equal(parseAssistantCommand("How is indexing?"), "indexing");
  assert.match(advisoryMessage("indexing").message, /unavailable/i);
});

test("local advisory intents do not become actions", () => {
  assert.equal(parseAssistantCommand("Suggest a new calculator idea"), "calculator_ideas");
  assert.equal(parseAssistantCommand("Switch to my other project"), "project_switch");
});