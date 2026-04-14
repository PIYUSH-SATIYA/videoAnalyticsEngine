# After Fixes (DB + Backend)

## Goal

Stabilize the DBMS-first analytics core so frontend issues are not caused by broken SQL defaults, mismatched API contracts, or missing query metadata.

## Database Part

### Implemented fixes

1. Anchored default query windows to latest observed dataset timestamp instead of `UTC_TIMESTAMP()`.
   - Why: seeded data is historical, so `last 30 days` from real clock returned empty rows.
   - Updated all KPI/TBL/GRF query defaults in `database/queries/analytics/*.sql`.

2. Fixed KPI-04 null-safety for engagement counters.
   - Why: empty windows could return `NULL` for `engagement_actions` / `raw_play_events`.
   - File: `database/queries/analytics/kpi_04_engagement_per_100_views_last_7d.sql`.

3. Improved index strategy with a new migration.
   - Added composite indexes in:
   - `database/schema/migrations_sql/009_mig_14-04-26_analytics_indexes.sql`
   - Includes indexes for common filter paths on `sessions`, `events`, `devices`, `users`.

4. Fixed migration 008 data-load cleanup for genre names.
   - Why: `genre_name` had trailing `\r` in outputs (CSV newline artifact).
   - File: `database/scripts/migrations/load_migration_008_data.sql` now trims `\r` on import.

5. Updated query documentation for new default-window behavior.
   - File: `database/docs/queries.md`.

### Still recommended for DB (next hardening pass)

1. Rework expensive queries (`TBL-04`, `TBL-05`, `GRF-03`) to avoid full-range heavy scans and repeated derived tables.
2. Normalize watch-time attribution logic in event-driven queries to prevent session-duration over-allocation across many event rows.
3. Run full `EXPLAIN` + runtime benchmark report for all 19 queries before frontend optimization.
4. Add a small lookup query pack for filter dropdowns (`distinct device_type`, `genres`, sampled `user_id`, sampled `video_id`).

## Backend Focused Pass

### Implemented fixes

1. Added query param normalization to bridge API contract mismatch.
   - Supports frontend-style repeated params (`device_type=mobile&device_type=desktop`) for table CSV filters.
   - Keeps legacy CSV compatibility (`device_type_csv=mobile,desktop`).
   - File: `backend/src/modules/analytics/analytics.paramBuilder.ts`.

2. Added `appliedFilters` in response metadata.
   - So frontend can show exactly what backend executed.
   - File: `backend/src/modules/analytics/analytics.controller.ts`.

3. Added SQL-side generation timestamp propagation.
   - Exposed as `meta.queryGeneratedAtUtc` from SQL metadata result set.
   - File: `backend/src/modules/analytics/analytics.controller.ts`.

4. Extended repository result contract to include normalized params.
   - Files:
   - `backend/src/modules/analytics/analytics.types.ts`
   - `backend/src/modules/analytics/analytics.repository.ts`

5. Fixed Express error middleware signature for reliable async error handling.
   - File: `backend/src/core/middleware/errorHandler.ts`

### Still recommended for backend (next hardening pass)

1. Add per-report zod query schemas (strict typing + better error messages per endpoint).
2. Add request timeout guard + query cancellation path for long-running reports.
3. Add endpoint for filter options (`/analytics/options/*`) to reduce frontend hardcoded filter values.
4. Add lightweight caching for stable global KPIs to reduce DB load.

## Validation Done

1. Backend compile checks:
   - `npm run typecheck` (backend)
   - `npm run build` (backend)

2. SQL checks (default windows now return real rows):
   - `kpi_02_watch_time_today.sql` returned non-zero watch time.
   - `tbl_01_top_binge_watchers.sql` returned ranked rows without explicit time params.
   - `grf_04_hourly_consumption_heatmap.sql` returned full heatmap points.

3. API checks:
   - Repeated param aliases now work for table endpoints (e.g., `device_type` -> `device_type_csv`, `genre_id` -> `genre_id_csv`).
   - `meta.appliedFilters`, `meta.queryTimeMs`, `meta.queryGeneratedAtUtc`, `meta.apiTimeMs` are returned.

## Ready for Frontend Phase

DB + backend are now materially more aligned for a DBMS project baseline.
Next phase should focus on UI behavior/sync only after this backend contract is consumed consistently per page/tab.

## Frontend Pass (Started After DB + Backend Stabilization)

### Implemented fixes

1. Removed apply-button workflow and made filters instant.
   - Global filters now update state and trigger requests immediately.
   - File: `frontend/src/components/GlobalFiltersBar.tsx`

2. Reduced global-filter bloat by moving detail filters local to relevant tabs.
   - Kept global: `startTs`, `endTs`, `deviceType`, `timeGrain`.
   - Moved local to specific pages:
     - Content page: `genreId`
     - Explorer page: `genreId`, `userId`, `videoId`, `heatmapMetric`
   - Files:
     - `frontend/src/context/globalFiltersStore.ts`
     - `frontend/src/components/GlobalFiltersBar.tsx`
     - `frontend/src/pages/ContentPage.tsx`
     - `frontend/src/pages/ExplorerPage.tsx`

3. Stopped sending empty date params so backend defaults can work correctly.
   - All pages now omit `start_ts`/`end_ts` when empty.
   - Files:
     - `frontend/src/pages/OverviewPage.tsx`
     - `frontend/src/pages/AudiencePage.tsx`
     - `frontend/src/pages/ContentPage.tsx`
     - `frontend/src/pages/QualityPage.tsx`
     - `frontend/src/pages/ExplorerPage.tsx`

4. Improved line-chart cursor tracking behavior.
   - Added `axisHighlight` on explorer line charts and overview trend line.
   - Files:
     - `frontend/src/pages/OverviewPage.tsx`
     - `frontend/src/pages/ExplorerPage.tsx`

5. Improved heatmap visual differentiation.
   - Reworked heatmap scatter into color-bucketed series for stronger contrast.
   - File: `frontend/src/pages/ExplorerPage.tsx`

### Frontend validation

1. `npm run lint` (frontend) passed.
2. `npm run build` (frontend) passed.
