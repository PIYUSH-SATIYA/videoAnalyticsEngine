-- 002_user.sql
-- User identity table

CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,

    status ENUM('active', 'suspended', 'deleted') NOT NULL DEFAULT 'active',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
