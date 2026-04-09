-- Bulk load synthetic CSV data into video analytics schema
-- Target: MariaDB / MySQL
--
-- Default CSV paths assume outputs from scripts/generate_synthetic_data.py:
-- /home/pbs/Desktop/projects/videoAnalyticsEngine/generated_data/*.csv
--
-- If LOCAL is disabled in your environment, either:
-- 1) enable local_infile in client/server, or
-- 2) copy files into secure_file_priv directory and remove LOCAL keyword.

SET autocommit = 0;
SET unique_checks = 0;
SET foreign_key_checks = 1;

-- Recommended parent-to-child load order:
-- users -> videos -> devices -> sessions -> events

SET @max_user_id = NULL;

-- USERS CSV columns: user_id,dob
LOAD DATA LOCAL INFILE '/home/pbs/Desktop/projects/videoAnalyticsEngine/generated_data/users.csv'
INTO TABLE users
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(@user_id)
-- (@user_id, @dob)
SET
  user_id = @user_id,
  name = CONCAT('User ', @user_id),
  email = CONCAT('user', @user_id, '@example.com'),
  phone = NULL,
  status = 'active',
  -- dob = @dob,
  created_at = NOW(),
  updated_at = NOW();

SET @max_user_id = (SELECT MAX(user_id) FROM users);

-- VIDEOS CSV columns: video_id
-- uploader_id derived to map within loaded users range.
LOAD DATA LOCAL INFILE '/home/pbs/Desktop/projects/videoAnalyticsEngine/generated_data/videos.csv'
INTO TABLE videos
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(@video_id)
SET
  video_id = @video_id,
  uploader_id = CASE
    WHEN @max_user_id IS NULL OR @max_user_id < 1 THEN 1
    ELSE 1 + ((@video_id - 1) % @max_user_id)
  END,
  title = CONCAT('Video ', @video_id),
  description = CONCAT('Synthetic video ', @video_id),
  duration_seconds = 30 + ((@video_id * 37) % 3600),
  visibility = 'public',
  created_at = NOW();

-- DEVICES CSV columns:
-- device_id,user_id,device_type,operating_system,browser,created_at
LOAD DATA LOCAL INFILE '/home/pbs/Desktop/projects/videoAnalyticsEngine/generated_data/devices.csv'
INTO TABLE devices
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(device_id, user_id, device_type, operating_system, browser, created_at);

-- SESSIONS CSV columns:
-- session_id,user_id,device_id,started_at,ended_at
LOAD DATA LOCAL INFILE '/home/pbs/Desktop/projects/videoAnalyticsEngine/generated_data/sessions.csv'
INTO TABLE sessions
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(session_id, user_id, device_id, started_at, ended_at);

-- EVENTS CSV columns:
-- event_id,session_id,video_id,event_type,event_timestamp
-- playback_position_seconds and metadata are optional -> set NULL.
LOAD DATA LOCAL INFILE '/home/pbs/Desktop/projects/videoAnalyticsEngine/generated_data/events.csv'
INTO TABLE events
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(event_id, session_id, video_id, event_type, event_timestamp)
SET
  playback_position_seconds = NULL,
  metadata = NULL;

COMMIT;
SET unique_checks = 1;
SET autocommit = 1;
