-- Rollback: Drop user_timezones table and related objects
-- Created: 2024-12-29
-- Description: Removes the user_timezones table and all related triggers/functions

-- Drop the trigger first
DROP TRIGGER IF EXISTS trigger_user_timezones_updated_at ON user_timezones;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_user_timezones_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_user_timezones_user_id;
DROP INDEX IF EXISTS idx_user_timezones_display_order;
DROP INDEX IF EXISTS idx_user_timezones_created_at;

-- Drop the table (CASCADE will remove foreign key constraints automatically)
DROP TABLE IF EXISTS user_timezones CASCADE;

-- Note: This will permanently delete all user timezone preferences
-- Consider backing up data before running this rollback