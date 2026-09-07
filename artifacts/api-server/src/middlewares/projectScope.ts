import { db, projectsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import type { RequestHandler } from "express";

export const requireProjectScope: RequestHandler = async (req, res, next) => {
  const projectId = req.params.projectId;
  if (typeof projectId !== "string") {
    res.status(400).json({ error: "Invalid projectId" });
    return;
  }

  const [project] = await db.select().from(projectsTable).where(and(
    eq(projectsTable.id, projectId),
    eq(projectsTable.ownerId, res.locals.ownerId),
  )).limit(1);

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.locals.project = project;
  next();
};