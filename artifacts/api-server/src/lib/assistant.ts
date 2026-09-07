export type AssistantIntent =
  | "performance"
  | "calculator_ideas"
  | "indexing"
  | "comparison"
  | "revenue"
  | "project_switch"
  | "approval_required"
  | "general";

const DESTRUCTIVE = /\b(delete|remove|archive|destroy|disconnect|connect|integrat(?:e|ion)|publish|deploy|unpublish)\b/i;

export function parseAssistantCommand(command: string): AssistantIntent {
  if (DESTRUCTIVE.test(command)) return "approval_required";
  if (/\b(performance|speed|slow|latency|core web vitals)\b/i.test(command)) return "performance";
  if (/\b(calculator|tool)\b.*\b(idea|suggest|new|build)\b/i.test(command)) return "calculator_ideas";
  if (/\b(index|indexing|search console|seo)\b/i.test(command)) return "indexing";
  if (/\b(compare|comparison)\b.*\b(project|site)\b/i.test(command)) return "comparison";
  if (/\b(revenue|income|sales|earnings)\b/i.test(command)) return "revenue";
  if (/\b(switch|change)\b.*\b(project|site)\b/i.test(command)) return "project_switch";
  return "general";
}

export function advisoryMessage(intent: AssistantIntent): { available: boolean; message: string } {
  switch (intent) {
    case "performance":
      return { available: false, message: "Performance analytics are unavailable because no analytics provider is connected." };
    case "calculator_ideas":
      return { available: true, message: "Consider calculators adjacent to your strongest construction topics; validate search demand before committing." };
    case "indexing":
      return { available: false, message: "Indexing data is unavailable because a search indexing provider is not connected." };
    case "comparison":
      return { available: false, message: "Project comparison is unavailable without at least two projects with connected analytics." };
    case "revenue":
      return { available: false, message: "Revenue data is unavailable because no revenue provider is connected." };
    case "project_switch":
      return { available: true, message: "Project switching is a client navigation action. Select a project from the project registry." };
    case "approval_required":
      return { available: false, message: "This intent can affect external or destructive state. A pending approval was created; no action was executed." };
    default:
      return { available: true, message: "I can advise on performance, calculator ideas, indexing, project comparison, revenue, and project switching." };
  }
}