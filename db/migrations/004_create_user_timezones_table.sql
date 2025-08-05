-- Migration: Create user_timezones table for saving timezone preferences
-- Created: 2024-12-29
-- Description: Stores user's saved timezone configurations for the timestamp converter tool

-- Create user_timezones table
CREATE TABLE IF NOT EXISTS user_timezones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    timezone VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Foreign key constraint
    CONSTRAINT fk_user_timezones_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate timezone for same user
    CONSTRAINT unique_user_timezone 
        UNIQUE (user_id, timezone)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_timezones_user_id ON user_timezones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_timezones_display_order ON user_timezones(user_id, display_order);
CREATE INDEX IF NOT EXISTS idx_user_timezones_created_at ON user_timezones(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_timezones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_timezones_updated_at
    BEFORE UPDATE ON user_timezones
    FOR EACH ROW
    EXECUTE FUNCTION update_user_timezones_updated_at();

-- Insert default timezone configurations for existing premium users
INSERT INTO user_timezones (user_id, timezone, label, display_order, is_default)
SELECT 
    u.id,
    'UTC',
    'UTC',
    0,
    true
FROM users u
WHERE u.plan = 'premium'
ON CONFLICT (user_id, timezone) DO NOTHING;

INSERT INTO user_timezones (user_id, timezone, label, display_order, is_default)
SELECT 
    u.id,
    'America/New_York',
    'New York',
    1,
    false
FROM users u
WHERE u.plan = 'premium'
ON CONFLICT (user_id, timezone) DO NOTHING;

INSERT INTO user_timezones (user_id, timezone, label, display_order, is_default)
SELECT 
    u.id,
    'Europe/London',
    'London',
    2,
    false
FROM users u
WHERE u.plan = 'premium'
ON CONFLICT (user_id, timezone) DO NOTHING;

INSERT INTO user_timezones (user_id, timezone, label, display_order, is_default)
SELECT 
    u.id,
    'Asia/Tokyo',
    'Tokyo',
    3,
    false
FROM users u
WHERE u.plan = 'premium'
ON CONFLICT (user_id, timezone) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE user_timezones IS 'Stores user timezone preferences for timestamp converter tool';
COMMENT ON COLUMN user_timezones.user_id IS 'Reference to the user who owns this timezone configuration';
COMMENT ON COLUMN user_timezones.timezone IS 'IANA timezone identifier (e.g., America/New_York, Europe/London)';
COMMENT ON COLUMN user_timezones.label IS 'User-friendly display label for the timezone';
COMMENT ON COLUMN user_timezones.display_order IS 'Order in which timezones should be displayed (0 = first)';
COMMENT ON COLUMN user_timezones.is_default IS 'Whether this is a default timezone that cannot be deleted';