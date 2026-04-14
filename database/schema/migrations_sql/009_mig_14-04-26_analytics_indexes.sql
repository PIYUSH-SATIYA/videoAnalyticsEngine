-- 009_mig_14-04-26_analytics_indexes.sql
-- Adds composite indexes for analytics filtering and grouping workloads.

CREATE INDEX idx_sessions_started_user_device
  ON sessions(started_at, user_id, device_id);

CREATE INDEX idx_events_ts_type_session_video
  ON events(event_timestamp, event_type, session_id, video_id);

CREATE INDEX idx_events_video_ts_type_session
  ON events(video_id, event_timestamp, event_type, session_id);

CREATE INDEX idx_devices_type_os_browser
  ON devices(device_type, operating_system, browser);

CREATE INDEX idx_users_dob
  ON users(dob);
