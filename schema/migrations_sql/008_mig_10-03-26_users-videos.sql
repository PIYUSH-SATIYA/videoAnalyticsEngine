-- 008_mig_10-03-26_users-videos.sql
-- Migration: add dob to users; add genre and video_genre tables

ALTER TABLE users ADD COLUMN dob DATE;

CREATE TABLE genre (
    genre_id  BIGINT       PRIMARY KEY AUTO_INCREMENT,
    name      VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE video_genre (
    video_id BIGINT NOT NULL,
    genre_id BIGINT NOT NULL,

    PRIMARY KEY (video_id, genre_id),

    CONSTRAINT fk_video_genre_video
        FOREIGN KEY (video_id)
        REFERENCES videos(video_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_video_genre_genre
        FOREIGN KEY (genre_id)
        REFERENCES genre(genre_id)
        ON DELETE CASCADE
);
