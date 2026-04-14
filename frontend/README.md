# Frontend

Multi-page analytics UI built with React, Tailwind CSS, daisyUI, and MUI.

## Stack

- React + TypeScript + Vite
- Tailwind CSS + daisyUI (general UI)
- MUI DataGrid and MUI X Charts (tables/charts)
- Axios (API client)

## Design constraints applied

- Multi-page information architecture (not single-page dashboard)
- Single blended theme (no dark/light mode switch)
- Restrained palette (no heavy blue/purple, no gradient overload)
- Query completion time badge visible near each KPI/table/chart result

## Backend integration

Backend base path: `/api/v1`

Used analytics endpoints include:

- `/api/v1/analytics/kpis/live-users`
- `/api/v1/analytics/kpis/watch-time-today`
- `/api/v1/analytics/kpis/avg-session-duration-last-7d`
- `/api/v1/analytics/kpis/engagement-per-100-views-last-7d`
- `/api/v1/analytics/tables/top-binge-watchers`
- `/api/v1/analytics/tables/most-viewed-genres-by-age`
- `/api/v1/analytics/tables/age-groups-watch-time-by-device`
- `/api/v1/analytics/tables/video-performance-by-genre`
- `/api/v1/analytics/tables/device-quality-friction`
- `/api/v1/analytics/graphs/avg-session-duration-trend`
- `/api/v1/analytics/graphs/genre-watch-trend`
- `/api/v1/analytics/graphs/event-mix-trend`
- `/api/v1/analytics/graphs/hourly-consumption-heatmap`
- `/api/v1/analytics/graphs/user-event-mix-trend`
- `/api/v1/analytics/graphs/video-performance-trend`

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```
