-- 005_sessions.sql
-- Session grouping table

CREATE TABLE sessions (
    session_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    user_id BIGINT NOT NULL,
    device_id BIGINT NOT NULL,

    started_at TIMESTAMP NOT NULL,
    ended_at   TIMESTAMP NOT NULL,

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
