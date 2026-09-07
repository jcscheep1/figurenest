---
name: Horsepower intent consolidation
description: Why FigureNest uses one canonical torque-and-RPM page for engine and generic horsepower searches.
---

Use one canonical torque-and-RPM horsepower calculator for both “Engine Horsepower Calculator” and “Horsepower Calculator” intent. Keep the existing Power converter as a separate unit-conversion tool.

**Why:** The two calculator phrases describe the same input model and result. Separate pages would compete for the same query and duplicate the same calculation, while the Power converter answers a genuinely different intent: converting an already-known power value.

**How to apply:** Add engine terminology, examples, and search tags to the shared horsepower page. Do not create a second engine-horsepower route unless a future tool has a materially different model, such as trap-speed, elapsed-time, or airflow-based estimation.