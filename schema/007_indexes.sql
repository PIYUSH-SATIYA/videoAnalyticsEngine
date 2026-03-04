-- 007_add_indexes.sql
-- Indexes for performance on analytical queries

CREATE INDEX idx_events_session_id
  ON events(session_id);

CREATE INDEX idx_events_video_id
  ON events(video_id);

CREATE INDEX idx_events_timestamps
  ON events(event_timestamp);

CREATE INDEX idx_sessions_user_id
  ON sessions(user_id);

CREATE INDEX idx_sessions_device_id
  ON sessions(device_id);
