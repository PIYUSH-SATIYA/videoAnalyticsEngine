-- load_migration_008_data.sql
-- Populates the data added by migration 008:
--   - users.dob       (UPDATE existing rows from regenerated users.csv)
--   - genre           (INSERT rows from generated genres.csv)
--   - video_genre     (INSERT rows from generated video_genre.csv)
--
-- Prerequisites:
--   1. schema/migrations_sql/008_mig_10-03-26_users-videos.sql has been applied.
--   2. scripts/generate_synthetic_data.py has been re-run to produce
--      updated CSVs (users.csv now contains dob; genres.csv and
--      video_genre.csv are new).

SET autocommit = 0;
SET unique_checks = 0;
SET foreign_key_checks = 1;

-- ---------------------------------------------------------------
-- Step 1: Backfill dob on existing users
-- Load user_id + dob into a temp table, then UPDATE users.
-- ---------------------------------------------------------------
CREATE TEMPORARY TABLE _tmp_user_dob (
    user_id BIGINT NOT NULL,
    dob     DATE
);

LOAD DATA LOCAL INFILE '/home/pbs/Desktop/projects/videoAnalyticsEngine/generated_data/users.csv'
INTO TABLE _tmp_user_dob
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(user_id, dob);

UPDATE users u
JOIN _tmp_user_dob t ON u.user_id = t.user_id
SET u.dob = t.dob;

DROP TEMPORARY TABLE _tmp_user_dob;

-- ---------------------------------------------------------------
-- Step 2: Insert genres
-- ---------------------------------------------------------------
LOAD DATA LOCAL INFILE '/home/pbs/Desktop/projects/videoAnalyticsEngine/generated_data/genres.csv'
INTO TABLE genre
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(@genre_id, @genre_name)
SET
  genre_id = @genre_id,
  name = TRIM(TRAILING '\r' FROM @genre_name);

-- ---------------------------------------------------------------
-- Step 3: Insert video <-> genre mappings
-- ---------------------------------------------------------------
LOAD DATA LOCAL INFILE '/home/pbs/Desktop/projects/videoAnalyticsEngine/generated_data/video_genre.csv'
INTO TABLE video_genre
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(video_id, genre_id);

COMMIT;
SET unique_checks = 1;
SET autocommit = 1;
