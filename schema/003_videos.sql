-- 003_video.sql
-- Video content table

CREATE TABLE videos (
    video_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    uploader_id BIGINT NOT NULL,

    title TEXT NOT NULL,
    description TEXT,
    duration_seconds INT NOT NULL CHECK (duration_seconds > 0),

    visibility ENUM('public', 'private', 'unlisted') NOT NULL DEFAULT 'public',


    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_videos_user
        FOREIGN KEY (uploader_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
