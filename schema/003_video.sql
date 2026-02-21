CREATE TABLE videos (
    video_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    uploader_id   BIGINT NOT NULL,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    duration_sec  INT NOT NULL,
    visibility    ENUM('public', 'private', 'unlisted') NOT NULL,
    upload_time   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_videos_uploader
        FOREIGN KEY (uploader_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)