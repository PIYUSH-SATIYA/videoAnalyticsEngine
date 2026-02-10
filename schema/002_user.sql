CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY, -- surrogate key, auto generated, immutable
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20), -- optional
    status ENUM(
        'active',
        'suspended',
        'deleted',
    ) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
)