-- Rollback: Drop user_world_clock_cities table and related objects
-- Created: 2024-12-29
-- Description: Removes the user_world_clock_cities table and all related triggers/functions

-- Drop the trigger first
DROP TRIGGER IF EXISTS trigger_user_world_clock_cities_updated_at ON user_world_clock_cities;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_user_world_clock_cities_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_user_world_clock_cities_user_id;
DROP INDEX IF EXISTS idx_user_world_clock_cities_display_order;
DROP INDEX IF EXISTS idx_user_world_clock_cities_created_at;
DROP INDEX IF EXISTS idx_user_world_clock_cities_timezone;

-- Drop the table (CASCADE will remove foreign key constraints automatically)
DROP TABLE IF EXISTS user_world_clock_cities CASCADE;

-- Note: This will permanently delete all user World Clock city selections
-- Consider backing up data before running this rollback