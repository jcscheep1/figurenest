---
name: Bundle chunk attribution
description: How to interpret misleading Vite/Rollup chunk names during FigureNest performance work.
---

Do not attribute an entire JavaScript payload to the module named in its generated filename. Vite/Rollup may use one shared module as the chunk name while packing catalogue data and dependencies from several calculator families into that chunk.

**Why:** A PageSpeed trace appeared to show a large Phase Four payload on the homepage. Moving the route constants changed the generated filename but barely changed total initial bytes because the heavy dependency was actually shared catalogue content.

**How to apply:** Compare compressed sizes and traverse `dist/public/.vite/manifest.json` imports before and after a change. A real route-level split must keep full definitions out of both the app shell and any homepage catalogue module.