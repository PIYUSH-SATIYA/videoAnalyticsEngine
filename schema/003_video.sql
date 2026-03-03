-- 003_video.sql
-- Video content table

CREATE TYPE video_visibility_enum AS ENUM (
    'public',
    'private',
    'unlisted'
);

CREATE TABLE videos (
    video_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    uploader_id UUID NOT NULL,

    title TEXT NOT NULL,
    description TEXT,
    duration_seconds INT NOT NULL CHECK (duration_seconds > 0),

    visibility video_visibility_enum NOT NULL DEFAULT 'public',

    upload_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    CONSTRAINT fk_videos_user
        FOREIGN KEY (uploader_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
