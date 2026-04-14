# Backend (TypeScript, MVC, analytics API)

Production-grade modular backend for read-only analytics APIs.

## Run

1. Copy `.env.example` to `.env` and set DB credentials.
2. Install dependencies:

```bash
npm install
```

3. Start in dev mode:

```bash
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Type Check

```bash
npm run typecheck
```

## API

- `GET /api/v1/health`
- `GET /api/v1/analytics/reports`
- `GET /api/v1/analytics/reports/:reportKey`
- `GET /api/v1/analytics/kpis/*`
- `GET /api/v1/analytics/tables/*`
- `GET /api/v1/analytics/graphs/*`

Each report response includes runtime metadata, including `queryTimeMs` for frontend display.

### Example endpoints

- `GET /api/v1/analytics/kpis/live-users`
- `GET /api/v1/analytics/tables/top-binge-watchers?start_ts=2026-03-01%2000:00:00&end_ts=2026-04-01%2000:00:00&limit=25`
- `GET /api/v1/analytics/graphs/genre-watch-trend?start_ts=2026-03-01%2000:00:00&end_ts=2026-04-01%2000:00:00&time_grain=week&genre_id=1`

### Response contract

- `data`: query rows
- `meta.requestId`: request correlation id
- `meta.queryId`: SQL-side query id (e.g. `TBL-01`)
- `meta.queryTimeMs`: SQL execution time from DB metadata result set
- `meta.apiTimeMs`: backend processing latency
- `meta.rowCount`: rows returned

## Notes

- SQL source of truth: `database/queries/analytics/*.sql`.
- This backend executes read-only analytics SQL and returns data + meta.
- For MariaDB compatibility, table-query pagination is implemented inside SQL via `ROW_NUMBER()` windows.
