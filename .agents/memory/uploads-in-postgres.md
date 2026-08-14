---
name: Uploads stored in PostgreSQL
description: Why admin image uploads live in the database instead of on disk, and the constraints to respect when touching upload/serving code.
---

# Uploads stored in PostgreSQL

**Rule:** Admin image uploads are persisted in PostgreSQL and served through an express route. Never write uploads to the filesystem in this project.

**Why:** Production runs on Replit Autoscale: the filesystem is ephemeral AND only the build-time static directory is served, so disk uploads 404 in production and vanish on instance restarts. This actually happened (Aug 2026): a client uploaded project photos in production that showed as broken images; the files were unrecoverable and had to be re-uploaded. Replit Object Storage tooling was not available in this environment at the time, so PostgreSQL was chosen as the persistent store.

**How to apply:**
- Keep stored images small (server-side compression before insert) so DB-backed storage stays viable at this brochure-site scale.
- Uploads are buffered in RAM before processing — keep per-file size limits × max files per request low enough for an Autoscale instance, and let the client upload large selections in small batches.
- Schema changes reach production only when the user republishes (publish flow diffs dev→prod schema). After any schema change, remind the user to republish.
- Deleting projects/news does not delete stored image rows (accepted orphan risk, flagged as follow-up work).
