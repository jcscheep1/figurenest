import { Router, type IRouter } from "express";
import {
  ArchiveProjectParams,
  ArchiveProjectResponse,
  ConfirmProjectApprovalParams,
  ConfirmProjectApprovalResponse,
  CreateProjectAlertBody,
  CreateProjectAlertParams,
  CreateProjectAlertResponse,
  CreateProjectApprovalBody,
  CreateProjectApprovalParams,
  CreateProjectApprovalResponse,
  CreateProjectBody,
  CreateProjectIntegrationBody,
  CreateProjectIntegrationParams,
  CreateProjectIntegrationResponse,
  CreateProjectResponse,
  GetDashboardSummaryParams,
  GetDashboardSummaryResponse,
  ListProjectAlertsParams,
  ListProjectAlertsResponse,
  ListProjectApprovalsParams,
  ListProjectApprovalsResponse,
  ListProjectAuditEventsParams,
  ListProjectAuditEventsResponse,
  ListProjectIntegrationsParams,
  ListProjectIntegrationsResponse,
  ListProjectsResponse,
  RunAssistantCommandBody,
  RunAssistantCommandParams,
  RunAssistantCommandResponse,
} from "@workspace/api-zod";
import {
  alertsTable,
  approvalsTable,
  auditEventsTable,
  db,
  integrationStatesTable,
  projectsTable,
  type Project,
} from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { advisoryMessage, parseAssistantCommand } from "../lib/assistant";
import { requireOwner } from "../middlewares/requireOwner";
import { requireProjectScope } from "../middlewares/projectScope";

const router: IRouter = Router();
router.use(requireOwner);

function projectEntity(project: Project) {
  return {
    id: project.id,
    name: project.name,
    domain: project.domain,
    status: project.status,
    constructionToolCount: project.constructionToolCount,
    publicRouteCount: project.publicRouteCount,
    analyticsStatus: project.analyticsStatus,
    revenueStatus: project.revenueStatus,
    indexingStatus: project.indexingStatus,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

async function audit(
  projectId: string,
  clerkUserId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  details: Record<string, unknown> = {},
) {
  await db.insert(auditEventsTable).values({
    projectId,
    actorClerkUserId: clerkUserId,
    action,
    entityType,
    entityId,
    redactedDetails: details,
  });
}

async function pendingApproval(projectId: string, clerkUserId: string, action: string, summary: string) {
  const [approval] = await db.insert(approvalsTable).values({
    projectId,
    requestedByClerkUserId: clerkUserId,
    action,
    summary,
    status: "pending",
  }).returning();
  if (!approval) throw new Error("Approval creation failed");
  return approval;
}

router.get("/projects", async (_req, res) => {
  const projects = await db.select().from(projectsTable)
    .where(eq(projectsTable.ownerId, res.locals.ownerId))
    .orderBy(desc(projectsTable.createdAt));
  res.json(ListProjectsResponse.parse(projects.map(projectEntity)));
});

router.post("/projects", async (req, res) => {
  const body = CreateProjectBody.parse(req.body);
  let domain: string;
  try {
    const parsed = new URL(body.domain);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("unsupported protocol");
    domain = parsed.origin;
  } catch {
    res.status(400).json({ error: "domain must be an absolute HTTP(S) URL" });
    return;
  }

  const [project] = await db.insert(projectsTable).values({
    ownerId: res.locals.ownerId,
    name: body.name.trim(),
    domain,
    constructionToolCount: 0,
    publicRouteCount: null,
    analyticsStatus: "not_connected",
    revenueStatus: "not_connected",
    indexingStatus: "not_connected",
  }).returning();
  if (!project) throw new Error("Project creation failed");
  await audit(project.id, res.locals.clerkUserId, "project.created", "project", project.id, { fields: ["name", "domain"] });
  res.status(201).json(CreateProjectResponse.parse(projectEntity(project)));
});

router.use("/projects/:projectId", requireProjectScope);

router.post("/projects/:projectId/archive", async (req, res) => {
  const { projectId } = ArchiveProjectParams.parse(req.params);
  const [project] = await db.update(projectsTable).set({
    status: "archived",
    updatedAt: new Date(),
  }).where(and(eq(projectsTable.id, projectId), eq(projectsTable.ownerId, res.locals.ownerId))).returning();
  if (!project) throw new Error("Project archive failed");
  await audit(projectId, res.locals.clerkUserId, "project.archived", "project", projectId);
  res.json(ArchiveProjectResponse.parse(projectEntity(project)));
});

router.get("/projects/:projectId/dashboard", async (req, res) => {
  const { projectId } = GetDashboardSummaryParams.parse(req.params);
  const project = res.locals.project as Project;
  const [[alertCount], [approvalCount]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(alertsTable)
      .where(and(eq(alertsTable.projectId, projectId), eq(alertsTable.resolved, false))),
    db.select({ count: sql<number>`count(*)::int` }).from(approvalsTable)
      .where(and(eq(approvalsTable.projectId, projectId), eq(approvalsTable.status, "pending"))),
  ]);
  res.json(GetDashboardSummaryResponse.parse({
    project: projectEntity(project),
    activeAlerts: alertCount?.count ?? 0,
    pendingApprovals: approvalCount?.count ?? 0,
    analytics: null,
    revenue: null,
    indexing: null,
  }));
});

router.get("/projects/:projectId/integrations", async (req, res) => {
  const { projectId } = ListProjectIntegrationsParams.parse(req.params);
  const integrations = await db.select().from(integrationStatesTable)
    .where(eq(integrationStatesTable.projectId, projectId))
    .orderBy(integrationStatesTable.provider);
  res.json(ListProjectIntegrationsResponse.parse(integrations));
});

router.post("/projects/:projectId/integrations", async (req, res) => {
  const { projectId } = CreateProjectIntegrationParams.parse(req.params);
  const body = CreateProjectIntegrationBody.parse(req.body);
  const approval = await pendingApproval(
    projectId,
    res.locals.clerkUserId,
    "integration.connect",
    `Review connection request for ${body.provider}`,
  );
  await audit(projectId, res.locals.clerkUserId, "approval.created", "approval", approval.id, { intent: "integration.connect", provider: body.provider });
  res.status(201).json(CreateProjectIntegrationResponse.parse(approval));
});

router.get("/projects/:projectId/alerts", async (req, res) => {
  const { projectId } = ListProjectAlertsParams.parse(req.params);
  const alerts = await db.select().from(alertsTable).where(eq(alertsTable.projectId, projectId))
    .orderBy(desc(alertsTable.createdAt));
  res.json(ListProjectAlertsResponse.parse(alerts));
});

router.post("/projects/:projectId/alerts", async (req, res) => {
  const { projectId } = CreateProjectAlertParams.parse(req.params);
  const body = CreateProjectAlertBody.parse(req.body);
  const [alert] = await db.insert(alertsTable).values({ projectId, ...body, resolved: false }).returning();
  if (!alert) throw new Error("Alert creation failed");
  await audit(projectId, res.locals.clerkUserId, "alert.created", "alert", alert.id, { severity: body.severity });
  res.status(201).json(CreateProjectAlertResponse.parse(alert));
});

router.get("/projects/:projectId/audit", async (req, res) => {
  const { projectId } = ListProjectAuditEventsParams.parse(req.params);
  const events = await db.select({
    id: auditEventsTable.id,
    projectId: auditEventsTable.projectId,
    action: auditEventsTable.action,
    entityType: auditEventsTable.entityType,
    entityId: auditEventsTable.entityId,
    redactedDetails: auditEventsTable.redactedDetails,
    createdAt: auditEventsTable.createdAt,
  }).from(auditEventsTable).where(eq(auditEventsTable.projectId, projectId))
    .orderBy(desc(auditEventsTable.createdAt));
  res.json(ListProjectAuditEventsResponse.parse(events));
});

router.post("/projects/:projectId/assistant/command", async (req, res) => {
  const { projectId } = RunAssistantCommandParams.parse(req.params);
  const { command } = RunAssistantCommandBody.parse(req.body);
  const category = parseAssistantCommand(command);
  const advisory = advisoryMessage(category);
  const approval = category === "approval_required"
    ? await pendingApproval(projectId, res.locals.clerkUserId, "assistant.external_intent", "Review assistant request requiring external or destructive action")
    : null;
  await audit(projectId, res.locals.clerkUserId, "assistant.command", "assistant", approval?.id ?? null, { category, command: "[REDACTED]" });
  res.json(RunAssistantCommandResponse.parse({ category, ...advisory, approval }));
});

router.get("/projects/:projectId/approvals", async (req, res) => {
  const { projectId } = ListProjectApprovalsParams.parse(req.params);
  const approvals = await db.select().from(approvalsTable).where(eq(approvalsTable.projectId, projectId))
    .orderBy(desc(approvalsTable.createdAt));
  res.json(ListProjectApprovalsResponse.parse(approvals));
});

router.post("/projects/:projectId/approvals", async (req, res) => {
  const { projectId } = CreateProjectApprovalParams.parse(req.params);
  const body = CreateProjectApprovalBody.parse(req.body);
  const approval = await pendingApproval(projectId, res.locals.clerkUserId, body.action, body.summary);
  await audit(projectId, res.locals.clerkUserId, "approval.created", "approval", approval.id, { action: body.action });
  res.status(201).json(CreateProjectApprovalResponse.parse(approval));
});

router.post("/projects/:projectId/approvals/:approvalId/confirm", async (req, res) => {
  const { projectId, approvalId } = ConfirmProjectApprovalParams.parse(req.params);
  const now = new Date();
  const [approval] = await db.update(approvalsTable).set({
    status: "approved",
    approvedAt: now,
    updatedAt: now,
  }).where(and(
    eq(approvalsTable.id, approvalId),
    eq(approvalsTable.projectId, projectId),
    eq(approvalsTable.status, "pending"),
  )).returning();
  if (!approval) {
    res.status(404).json({ error: "Pending approval not found" });
    return;
  }
  await audit(projectId, res.locals.clerkUserId, "approval.confirmed", "approval", approval.id, { execution: "none" });
  res.json(ConfirmProjectApprovalResponse.parse(approval));
});

export const controlRouter = router;