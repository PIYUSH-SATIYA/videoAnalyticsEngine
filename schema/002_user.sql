-- 002_user.sql
-- User identity table

CREATE TYPE user_status_enum AS ENUM (
    'active',
    'suspended',
    'deleted'
);

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,

    status user_status_enum NOT NULL DEFAULT 'active',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
