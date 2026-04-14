# Analytics SQL Query Pack

This directory contains read-only analytics SQL scripts for the DB-first phase.

## Conventions

- Each file returns two result sets:
  1. analytics result,
  2. metadata: `query_id`, `query_time_ms`, `generated_at_utc`.
- Runtime is measured inside SQL with `NOW(6)` and `TIMESTAMPDIFF(MICROSECOND, ...)`.
- KPI scripts are global rollups with fixed windows and no filters.
- Graph scripts support a time window plus at most one optional segment filter.
- Tabular scripts support richer filters with pagination defaults.
- Scripts are read-only and wrapped in a transaction for consistent reads.

## Parameter style

- Parameters are SQL user variables (`@start_ts`, `@end_ts`, `@limit`, etc.).
- If a variable is not provided, the script applies a default value.
- Multi-select filters use CSV strings in SQL scripts (`@device_type_csv = 'mobile,tv'`).
  - Future API layer can accept repeated query params and translate to CSV.
