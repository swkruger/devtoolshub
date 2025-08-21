-- Rollback: Disable Row Level Security (RLS) on user tables
-- Created: 2025-01-21
-- Description: Disables RLS on user_timezones and user_world_clock_cities tables

-- Drop RLS policies for user_world_clock_cities table
DROP POLICY IF EXISTS "Users can view own world clock cities" ON user_world_clock_cities;
DROP POLICY IF EXISTS "Users can insert own world clock cities" ON user_world_clock_cities;
DROP POLICY IF EXISTS "Users can update own world clock cities" ON user_world_clock_cities;
DROP POLICY IF EXISTS "Users can delete own world clock cities" ON user_world_clock_cities;

-- Disable RLS on user_world_clock_cities table
ALTER TABLE user_world_clock_cities DISABLE ROW LEVEL SECURITY;

-- Drop RLS policies for user_timezones table
DROP POLICY IF EXISTS "Users can view own timezones" ON user_timezones;
DROP POLICY IF EXISTS "Users can insert own timezones" ON user_timezones;
DROP POLICY IF EXISTS "Users can update own timezones" ON user_timezones;
DROP POLICY IF EXISTS "Users can delete own timezones" ON user_timezones;

-- Disable RLS on user_timezones table
ALTER TABLE user_timezones DISABLE ROW LEVEL SECURITY;

-- Note: Function search_path fixes are not rolled back as they improve security
-- The functions will retain their SECURITY DEFINER and explicit search_path settings
