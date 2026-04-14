# Full Plan: DB Analytics First, API-Ready, Multi-Page UX

## 1) Goal and scope

- Build the analytics layer in the database first (query definitions and validation), then expose via APIs, then integrate into frontend pages.
- Do not change existing schema design in this phase.
- Focus on high-value streaming business analytics (engagement, watch time, audience cohorts, device behavior, content performance).

## 2) Architecture direction to keep now (for later integration)

- Query-first backend contract: each business query maps to one API endpoint.
- API responses must carry explicit filter echo (`applied_filters`) to make dashboard state debuggable.
- Separate endpoint families:
  - `/v1/analytics/kpi/*`
  - `/v1/analytics/tables/*`
  - `/v1/analytics/graphs/*`
- Keep pagination and sorting only for table endpoints; graph endpoints return series arrays.
- Standard response envelope for all endpoints:
  - `data`
  - `applied_filters`
  - `meta` (`query_id`, `generated_at_utc`, pagination/sort/time_grain)
  - `warnings` (optional)
- KPI policy: KPI cards are global system summaries and must not accept filters.
- Graph policy: each graph accepts max 1 optional segment filter in addition to time range/time grain.
- DB-performance visibility policy: every analytics endpoint must expose `meta.query_time_ms` for frontend display.

## 3) Step-by-step execution plan

### Step 0: Data-readiness gate (must pass before query implementation)
- Confirm migration `008` strategy is executable for this environment.
- Resolve `users.csv` mismatch for `dob` load before any age-segment analytics.
- Confirm local path setup for loader scripts that use hardcoded absolute CSV paths.

### Step 1: Finalize analytics catalog (spec only)
- Lock query definitions in `database/docs/queries.md` (IDs, metric terms, outputs, filters).
- Mark which queries depend on migration `008` (age + genre).
- Freeze naming conventions (`watch_time_seconds`, `view_count`, `engagement_actions`).

### Step 2: Define filter DTO contract (API-ready without coding)
- Standardize request params:
  - required core for non-live queries: `start_ts`, `end_ts` (UTC ISO-8601)
  - optional segmentation: `age_min`, `age_max`, repeated params for multi-select (`device_type`, `operating_system`, `browser`, `genre_id`)
  - threshold controls: `min_watch_seconds`, `min_sessions`, `min_events`
  - table controls: `limit`, `offset`, `sort_by`, `sort_order`
  - graph control: `time_grain` (`day|week|month`)
- Define validation rules now (for future backend):
  - date window max span (for performance),
  - enforce `start_ts < end_ts` and closed-open time windows,
  - numeric bounds non-negative,
  - enumerations validated against known values.

### Step 3: Query authoring phase (next implementation phase)
- Create SQL files for each query ID (`KPI-*`, `TBL-*`, `GRF-*`) under a dedicated analytics query folder.
- Keep one query per file and include placeholder filter comments.
- Ensure all table queries support deterministic sorting and pagination.
- Add runtime instrumentation block in each SQL file (`start_ts`/`end_ts` in SQL, metadata result set).

### Step 4: Performance and explainability checks
- For each heavy query, run `EXPLAIN` and record execution notes.
- Add deterministic sorting rules (primary + tie-breaker) for every table query.
- If needed, plan new migration file(s) only for additional indexes (no inline schema edits).
- Capture measured runtime (`query_time_ms`) in validation logs per query.

### Step 5: Data validation loop in DB
- Rebuild disposable database from schema scripts.
- Generate synthetic data from repo root.
- Load data with canonical load scripts.
- Run each query and validate:
  - result shape matches spec,
  - filter combinations work,
  - no ambiguous metric names.

### Step 6: API design package (still planning)
- For each query ID, define:
  - endpoint path,
  - request params,
  - response schema,
  - error cases (`400` invalid format/enum, `422` logically invalid combinations, `500` execution fail).
- Add query-to-endpoint mapping table in docs for backend build phase.
- Freeze sort allowlist per table endpoint and include default tie-breakers.
- Include `meta.query_time_ms` and `meta.generated_at_utc` in every response contract.

### Step 7: Frontend IA (information architecture) for multi-page analytics
- Avoid one overcrowded page.
- Define minimal high-value routes:
  1. `/analytics/overview`
     - KPI cards + 1 or 2 trend graphs + top anomalies.
  2. `/analytics/audience`
     - age/device cohort tables + behavior trend graphs.
  3. `/analytics/content`
     - genre/video performance table + watch/engagement trends.
  4. `/analytics/quality`
     - device/os/browser quality friction tables and charts.
  5. `/analytics/users/:user_id` (drill-down)
     - session timeline + watch summary + event mix for one user.
  6. `/analytics/videos/:video_id` (drill-down)
     - performance summary + audience split + engagement trend.
- Route design principle: each page answers one decision theme, not mixed unrelated widgets.

### Step 8: UX rules to prevent redundancy
- Global filters pinned at top-level (date range + primary segments), inherited by all subpages.
- Page-local filters only when they unlock unique analysis (not duplicate controls everywhere).
- Use drill-down links from tables to detail pages instead of duplicating the same detailed table across pages.
- Keep metric definitions accessible via tooltip/help drawer using the metric terms from query spec.

### Step 9: Drill-down query specs for detail routes
- Add explicit query IDs for user and video detail pages:
  - `TBL-07/GRF-05`: user detail timeline and event mix (`/analytics/users/:user_id`).
  - `TBL-08/GRF-06`: video detail performance and audience split (`/analytics/videos/:video_id`).
- Ensure detail routes reuse global filters and avoid duplicate summary widgets from parent pages.
- Detail routes support focused filters only (`start_ts`, `end_ts`, optional `device_type`), no extra filter sprawl.

### Step 10: Delivery milestones
- Milestone A: data-readiness gate passed + analytics catalog and filter contract complete.
- Milestone B: all SQL queries implemented and validated in DB.
- Milestone B.1: runtime telemetry verified (`query_time_ms`) and visible in query outputs.
- Milestone C: API contracts finalized and approved.
- Milestone D: multi-page frontend wireframe and route map finalized.
- Milestone E: backend + frontend implementation and integration.

## 4) Query set to prioritize for highest value

- Primary KPIs: `KPI-01`, `KPI-02`, `KPI-03`, `KPI-04`, `KPI-05`.
- Core tables: `TBL-01`, `TBL-02`, `TBL-03`, `TBL-04`.
- Core graphs: `GRF-01`, `GRF-02`, `GRF-03`.
- Secondary (after core): `TBL-05`, `TBL-06`, `GRF-04`.
- Drill-down pack: `TBL-07`, `TBL-08`, `GRF-05`, `GRF-06`.

## 5) Risks and mitigations

- Risk: migration `008` data load mismatch (`users.csv` missing `dob` currently).
  - Mitigation: resolve generator/loader compatibility before age-based analytics rollout.
- Risk: hardcoded absolute CSV paths in loader scripts.
  - Mitigation: keep local environment path aligned or parameterize in a future maintenance pass.
- Risk: no automated test suite.
  - Mitigation: maintain a repeatable manual verification checklist per query.
- Risk: runtime numbers can vary heavily with warm cache and concurrent load.
  - Mitigation: collect both cold and warm timings and report median across multiple runs.

## 6) DBMS-heavy concepts to include during SQL phase

- Views for reusable analytics foundations (`session_facts`, `event_facts`) to reduce duplication.
- Stored procedures for parameterized analytics execution where useful.
- Transaction wrapping for multi-step runtime measurement + result consistency.
- Optional lock usage only for controlled benchmark runs (avoid locking hot tables in normal analytics paths).
- Trigger usage only when introducing future aggregate/helper tables; not required for current read-focused phase.

## 7) Definition of done for current planning phase

- `AGENTS.md` exists with repo-specific operational guidance.
- `database/docs/queries.md` contains concrete analytics query specs aligned with implemented read-only analytics SQL files.
- `full_plan.md` documents phased execution from DB analytics to API and multi-page frontend integration.
