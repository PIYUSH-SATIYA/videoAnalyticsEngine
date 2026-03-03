-- 005_sessions.sql
-- Session grouping table

CREATE TABLE sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    device_id UUID NOT NULL,

    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at   TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sessions_device
        FOREIGN KEY (device_id)
        REFERENCES devices(device_id)
        ON DELETE CASCADE,

    CONSTRAINT session_time_valid
        CHECK (ended_at >= started_at)
);
