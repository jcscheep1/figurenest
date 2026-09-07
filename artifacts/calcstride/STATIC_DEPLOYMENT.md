# Historical static deployment note

FigureNest is intentionally staying on the existing combined **Autoscale**
deployment with the API artifact in the same project. Do not use this file to
change the deployment type or split the project.

The current production web service runs the redirect-aware FigureNest HTTP server
and serves the built prerendered site. See
[PRODUCTION_HOSTING.md](./PRODUCTION_HOSTING.md) for the active Autoscale
configuration and domain steps.