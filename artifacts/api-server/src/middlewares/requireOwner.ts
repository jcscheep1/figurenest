import { clerkClient, getAuth } from "@clerk/express";
import {
  db,
  integrationStatesTable,
  ownersTable,
  ownerUsersTable,
  projectsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "express";

export const SOLE_OWNER_ID = "figurenest-sole-owner";

export function clerkUserIdFromAuth(auth: ReturnType<typeof getAuth>): string | null {
  const claim = auth.sessionClaims?.userId;
  return (typeof claim === "string" && claim) || auth.userId || null;
}

export function ownerEmailMatches(
  configuredOwnerEmail: string | undefined,
  primaryEmail: string | undefined,
): boolean {
  const configured = configuredOwnerEmail?.trim().toLowerCase();
  const actual = primaryEmail?.trim().toLowerCase();
  return Boolean(configured && actual && configured === actual);
}

export const requireOwner: RequestHandler = async (req, res, next) => {
  const clerkUserId = clerkUserIdFromAuth(getAuth(req));
  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const configuredOwnerEmail = process.env.CONTROL_CENTER_OWNER_EMAIL;
    if (!configuredOwnerEmail?.trim()) {
      res.status(503).json({ error: "Control Center owner access is not configured" });
      return;
    }

    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const primaryEmail = clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress;
    if (!ownerEmailMatches(configuredOwnerEmail, primaryEmail)) {
      res.status(403).json({ error: "This account is not authorized for the Control Center" });
      return;
    }

    await db.insert(ownersTable).values({
      id: SOLE_OWNER_ID,
      clerkUserId,
    }).onConflictDoNothing();

    const [owner] = await db.select().from(ownersTable).where(eq(ownersTable.id, SOLE_OWNER_ID)).limit(1);
    if (!owner || owner.clerkUserId !== clerkUserId) {
      res.status(403).json({ error: "This Control Center belongs to another owner" });
      return;
    }

    await db.insert(ownerUsersTable).values({
      ownerId: owner.id,
      clerkUserId,
    }).onConflictDoNothing();

    const [project] = await db.insert(projectsTable).values({
      ownerId: owner.id,
      name: "FigureNest",
      domain: "https://figurenest.com",
      constructionToolCount: 20,
      publicRouteCount: null,
      analyticsStatus: "not_connected",
      revenueStatus: "not_connected",
      indexingStatus: "not_connected",
    }).onConflictDoNothing().returning();

    const canonicalProject = project ?? (await db.select().from(projectsTable)
      .where(eq(projectsTable.ownerId, owner.id))).find((item) => item.domain === "https://figurenest.com");

    if (canonicalProject) {
      for (const provider of ["analytics", "revenue", "indexing"]) {
        await db.insert(integrationStatesTable).values({
          projectId: canonicalProject.id,
          provider,
          status: "not_connected",
        }).onConflictDoNothing();
      }
    }

    res.locals.ownerId = owner.id;
    res.locals.clerkUserId = clerkUserId;
    next();
  } catch (error) {
    req.log.error({ err: error }, "owner authorization failed");
    res.status(500).json({ error: "Unable to authorize owner" });
  }
};