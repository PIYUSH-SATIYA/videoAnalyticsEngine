#!/usr/bin/env bash

set -euo pipefail

# ============================================================
# Database Reset / Bootstrap Script
#
# Responsibilities:
#   1. Recreate Dockerized MariaDB environment
#   2. Apply base schema
#   3. Apply schema migrations
#   4. Load synthetic base dataset
#   5. Apply migration-specific backfill data
#   6. Validate resulting dataset
#
# Notes:
#   - Synthetic CSV generation is intentionally NOT executed
#     inside the MariaDB container.
#
#   - Generate data manually on host machine if needed:
#
#       python database/scripts/generate_synthetic_data.py
#
# ============================================================

DB_CONTAINER="videoAnalytics-mariadb"

DB_NAME="videoAnalytics"
DB_USER="root"
DB_PASSWORD="pbsatiya"

# ------------------------------------------------------------
# Helper function
# ------------------------------------------------------------

run_sql_file() {
  local file_path="$1"

  echo "   -> $(basename "$file_path")"

  docker exec -i "$DB_CONTAINER" \
    mariadb --local-infile=1 \
    -u"$DB_USER" \
    -p"$DB_PASSWORD" \
    "$DB_NAME" \
    <"$file_path"
}

# ------------------------------------------------------------
# Reset infrastructure
# ------------------------------------------------------------

echo "==> Resetting Docker containers and volumes..."
docker compose down -v

echo
echo "==> Starting MariaDB container..."
docker compose up -d

echo
echo "==> Waiting for MariaDB to become ready..."

until docker exec "$DB_CONTAINER" \
  mariadb-admin ping \
  -u"$DB_USER" \
  -p"$DB_PASSWORD" \
  --silent; do

  sleep 2
done

# ------------------------------------------------------------
# Recreate database
# ------------------------------------------------------------

echo
echo "==> Recreating database..."

docker exec "$DB_CONTAINER" \
  mariadb -u"$DB_USER" -p"$DB_PASSWORD" -e "
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
"

# ------------------------------------------------------------
# Apply base schema
# ------------------------------------------------------------

echo
echo "==> Applying base schema..."

BASE_SCHEMA_FILES=(
  "database/schema/001_init.sql"
  "database/schema/002_users.sql"
  "database/schema/003_videos.sql"
  "database/schema/004_device.sql"
  "database/schema/005_sessions.sql"
  "database/schema/006_events.sql"
  "database/schema/007_indexes.sql"
)

for file in "${BASE_SCHEMA_FILES[@]}"; do
  run_sql_file "$file"
done

# ------------------------------------------------------------
# Apply schema migrations
# ------------------------------------------------------------

echo
echo "==> Applying schema migrations..."

SCHEMA_MIGRATIONS=(
  "database/schema/migrations_sql/008_mig_10-03-26_users-videos.sql"
  "database/schema/migrations_sql/009_mig_14-04-26_analytics_indexes.sql"
)

for file in "${SCHEMA_MIGRATIONS[@]}"; do
  run_sql_file "$file"
done

# ------------------------------------------------------------
# Synthetic data generation
# ------------------------------------------------------------

echo
echo "==> Synthetic CSV generation"

echo "   Run manually on host machine if regeneration is needed:"
echo
echo "   python database/scripts/generate_synthetic_data.py"

# ------------------------------------------------------------
# Load base synthetic dataset
# ------------------------------------------------------------

echo
echo "==> Loading base synthetic dataset..."

run_sql_file "database/scripts/load_synthetic_csv.sql"

# ------------------------------------------------------------
# Apply migration-specific data backfills
# ------------------------------------------------------------

echo
echo "==> Applying migration data backfills..."

DATA_MIGRATIONS=(
  "database/scripts/migrations/008_backfill_users_genres_migration.sql"
)

for file in "${DATA_MIGRATIONS[@]}"; do
  run_sql_file "$file"
done

# ------------------------------------------------------------
# Validation
# ------------------------------------------------------------

echo
echo "==> Running validation queries..."

docker exec "$DB_CONTAINER" \
  mariadb -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "

SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL
SELECT 'videos', COUNT(*) FROM videos
UNION ALL
SELECT 'genre', COUNT(*) FROM genre
UNION ALL
SELECT 'video_genre', COUNT(*) FROM video_genre
UNION ALL
SELECT 'devices', COUNT(*) FROM devices
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'events', COUNT(*) FROM events;

"

echo
echo "==> Database reset complete."
