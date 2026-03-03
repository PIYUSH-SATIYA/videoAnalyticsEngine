-- 006_events.sql
-- Immutable behavioral log

CREATE TYPE event_type_enum AS ENUM (
    'play',
    'pause',
    'seek',
    'like',
    'share',
    'comment',
    'quality_change',
    'exit'
);

CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    session_id UUID NOT NULL,
    video_id UUID NOT NULL,

    event_type event_type_enum NOT NULL,

    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,

    playback_position_seconds INT
        CHECK (
            playback_position_seconds IS NULL
            OR playback_position_seconds >= 0
        ),

    metadata JSONB,

    CONSTRAINT fk_events_session
        FOREIGN KEY (session_id)
        REFERENCES sessions(session_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_events_video
        FOREIGN KEY (video_id)
        REFERENCES videos(video_id)
        ON DELETE CASCADE
);
