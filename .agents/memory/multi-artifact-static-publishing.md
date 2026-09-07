---
name: Multi-artifact static publishing
description: Replit publication boundary when a static web artifact shares a project with a runnable artifact.
---

A Replit project publishes all of its artifacts together. A project that includes
both a static web artifact and a runnable API artifact is therefore not a true
Static Deployment, even when the web artifact itself has a static production
service.

**Why:** FigureNest's public output can be fully static, but its authenticated API
keeps the combined publication runnable. Treating the web artifact's static
manifest as sufficient would give the owner incorrect launch instructions.

**How to apply:** Before switching a multi-artifact project to Static, move any
required runnable artifact into a separately published project and reconnect the
client to it, or explicitly retire that runnable functionality. Do not imply that
the Publishing UI can deploy one artifact independently from the project.