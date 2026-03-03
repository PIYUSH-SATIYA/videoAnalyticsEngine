-- 004_device.sql
-- Device context table

CREATE TABLE devices (
    device_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    user_id BIGINT NOT NULL,

    device_type ENUM(
    'mobile',
    'desktop',
    'tablet',
    'tv'
    ) NOT NULL,
    operating_system TEXT,
    browser TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_devices_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
