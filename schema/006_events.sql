-- 006_events.sql
-- Immutable behavioral log

CREATE TABLE events (
    event_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    session_id BIGINT NOT NULL,
    video_id BIGINT NOT NULL,

    event_type ENUM (
    'play',
    'pause',
    'seek',
    'like',
    'share',
    'comment',
    'quality_change',
    'exit'
) NOT NULL,

    event_timestamp TIMESTAMP NOT NULL,

    playback_position_seconds INT
        CHECK (

            playback_position_seconds IS NULL
            OR playback_position_seconds >= 0
        ),

    metadata JSON,

    CONSTRAINT fk_events_session
        FOREIGN KEY (session_id)
        REFERENCES sessions(session_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_events_video
        FOREIGN KEY (video_id)
        REFERENCES videos(video_id)
        ON DELETE CASCADE
);
