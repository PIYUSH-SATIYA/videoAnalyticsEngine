-- 004_device.sql
-- Device context table

CREATE TYPE device_type_enum AS ENUM (
    'mobile',
    'desktop',
    'tablet',
    'tv'
);

CREATE TABLE devices (
    device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    device_type device_type_enum NOT NULL,
    operating_system TEXT,
    browser TEXT,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    CONSTRAINT fk_devices_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
