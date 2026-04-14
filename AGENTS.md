# AGENTS.md

## Repo Reality
- This repo is currently database-first. `backend/` and `frontend/` are empty placeholders.
- There is no repo-level CI workflow, test runner, linter, formatter, or task runner configured.

## Source Of Truth
- Treat `database/schema/*.sql` as migration history. Do not edit old numbered files after they are used; add a new numbered file.
- Apply base schema in numeric order: `001` -> `007`, then apply files under `database/schema/migrations_sql/`.
- Keep mutating SQL out of `database/queries/`; that directory is for analytics/read queries.

## Canonical Commands (run from repo root)
- Apply base schema files one by one:
  - `sudo mariadb -p video_analytics < database/schema/001_init.sql`
  - `sudo mariadb -p video_analytics < database/schema/002_users.sql`
  - `sudo mariadb -p video_analytics < database/schema/003_videos.sql`
  - `sudo mariadb -p video_analytics < database/schema/004_device.sql`
  - `sudo mariadb -p video_analytics < database/schema/005_sessions.sql`
  - `sudo mariadb -p video_analytics < database/schema/006_events.sql`
  - `sudo mariadb -p video_analytics < database/schema/007_indexes.sql`
- Generate synthetic data: `python3 database/scripts/generate_synthetic_data.py`
- Bulk load synthetic CSVs: `sudo mariadb --local-infile=1 -p video_analytics < database/scripts/load_synthetic_csv.sql`
- Apply migration 008: `sudo mariadb -p video_analytics < database/schema/migrations_sql/008_mig_10-03-26_users-videos.sql`
- Load migration 008 data: `sudo mariadb --local-infile=1 -p video_analytics < database/scripts/migrations/load_migration_008_data.sql`

## Critical Gotchas
- `database/scripts/generate_synthetic_data.py` writes to `generated_data/` relative to current working directory; run from repo root.
- Load scripts use hardcoded absolute paths: `/home/pbs/Desktop/projects/videoAnalyticsEngine/generated_data/*.csv`.
- Committed sample CSVs are under `database/generated_data/`, but current load scripts do not read from that path.
- `database/scripts/migrations/load_migration_008_data.sql` expects `users.csv` with `user_id,dob`, while the current generator writes only `user_id` (DOB output is commented out).
- `database/queries/load_synthetic_csv.sql` duplicates `database/scripts/load_synthetic_csv.sql`; prefer `database/scripts/...` for operational loading and keep both synchronized if one changes.

## Verification Expectations
- With no automated suite, validate by recreating a disposable local DB from schema files and running the relevant load/query SQL end-to-end.
