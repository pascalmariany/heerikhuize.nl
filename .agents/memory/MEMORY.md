# Memory index

- [Uploads stored in PostgreSQL](uploads-in-postgres.md) — never write uploads to disk; Autoscale FS is ephemeral and only dist/public is served, so uploads go in the uploaded_images table.
