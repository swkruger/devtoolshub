-- Migration: Create user_world_clock_cities table for saving World Clock city selections
-- Created: 2024-12-29
-- Description: Stores user's selected cities for the World Clock tool with full city metadata

-- Create user_world_clock_cities table
CREATE TABLE IF NOT EXISTS user_world_clock_cities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    city_id VARCHAR(100) NOT NULL,
    city_name VARCHAR(255) NOT NULL,
    custom_label VARCHAR(255), -- User's custom label for the city
    country VARCHAR(255) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    timezone VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    region VARCHAR(255),
    population INTEGER,
    is_popular BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Foreign key constraint
    CONSTRAINT fk_user_world_clock_cities_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate city for same user
    CONSTRAINT unique_user_world_clock_city 
        UNIQUE (user_id, city_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_world_clock_cities_user_id ON user_world_clock_cities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_world_clock_cities_display_order ON user_world_clock_cities(user_id, display_order);
CREATE INDEX IF NOT EXISTS idx_user_world_clock_cities_created_at ON user_world_clock_cities(created_at);
CREATE INDEX IF NOT EXISTS idx_user_world_clock_cities_timezone ON user_world_clock_cities(timezone);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_world_clock_cities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_world_clock_cities_updated_at
    BEFORE UPDATE ON user_world_clock_cities
    FOR EACH ROW
    EXECUTE FUNCTION update_user_world_clock_cities_updated_at();

-- Insert default cities for existing users (popular cities)
INSERT INTO user_world_clock_cities (
    user_id, city_id, city_name, country, country_code, timezone, 
    latitude, longitude, is_popular, display_order
)
SELECT 
    u.id,
    'new-york',
    'New York',
    'United States',
    'US',
    'America/New_York',
    40.7128,
    -74.0060,
    true,
    0
FROM users u
WHERE u.plan = 'premium'
ON CONFLICT (user_id, city_id) DO NOTHING;

INSERT INTO user_world_clock_cities (
    user_id, city_id, city_name, country, country_code, timezone, 
    latitude, longitude, is_popular, display_order
)
SELECT 
    u.id,
    'london',
    'London',
    'United Kingdom',
    'GB',
    'Europe/London',
    51.5074,
    -0.1278,
    true,
    1
FROM users u
WHERE u.plan = 'premium'
ON CONFLICT (user_id, city_id) DO NOTHING;

INSERT INTO user_world_clock_cities (
    user_id, city_id, city_name, country, country_code, timezone, 
    latitude, longitude, is_popular, display_order
)
SELECT 
    u.id,
    'tokyo',
    'Tokyo',
    'Japan',
    'JP',
    'Asia/Tokyo',
    35.6762,
    139.6503,
    true,
    2
FROM users u
WHERE u.plan = 'premium'
ON CONFLICT (user_id, city_id) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE user_world_clock_cities IS 'Stores user selected cities for World Clock tool';
COMMENT ON COLUMN user_world_clock_cities.user_id IS 'Reference to the user who owns this city selection';
COMMENT ON COLUMN user_world_clock_cities.city_id IS 'Unique identifier for the city (e.g., new-york, london)';
COMMENT ON COLUMN user_world_clock_cities.city_name IS 'Original display name of the city';
COMMENT ON COLUMN user_world_clock_cities.custom_label IS 'User-defined custom label for the city (optional)';
COMMENT ON COLUMN user_world_clock_cities.country IS 'Country name where the city is located';
COMMENT ON COLUMN user_world_clock_cities.country_code IS 'ISO country code (e.g., US, GB, JP)';
COMMENT ON COLUMN user_world_clock_cities.timezone IS 'IANA timezone identifier (e.g., America/New_York)';
COMMENT ON COLUMN user_world_clock_cities.latitude IS 'City latitude coordinates';
COMMENT ON COLUMN user_world_clock_cities.longitude IS 'City longitude coordinates';
COMMENT ON COLUMN user_world_clock_cities.display_order IS 'Order in which cities should be displayed (0 = first)';
COMMENT ON COLUMN user_world_clock_cities.is_popular IS 'Whether this is a popular/featured city';