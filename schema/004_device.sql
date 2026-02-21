CREATE TABLE devices (
    device_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    device_type  ENUM('mobile', 'desktop', 'tablet', 'tv'),
    os           VARCHAR(100),
    browser      VARCHAR(100),
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_devices_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)