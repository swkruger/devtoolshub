-- Migration: Enable Row Level Security (RLS) on user tables
-- Created: 2025-01-21
-- Description: Enables RLS on user_timezones and user_world_clock_cities tables for security

-- Enable RLS on user_timezones table
ALTER TABLE user_timezones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_timezones table
-- Policy: Users can only see their own timezone configurations
CREATE POLICY "Users can view own timezones" ON user_timezones
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own timezone configurations
CREATE POLICY "Users can insert own timezones" ON user_timezones
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own timezone configurations
CREATE POLICY "Users can update own timezones" ON user_timezones
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own timezone configurations
CREATE POLICY "Users can delete own timezones" ON user_timezones
    FOR DELETE
    USING (auth.uid() = user_id);

-- Enable RLS on user_world_clock_cities table
ALTER TABLE user_world_clock_cities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_world_clock_cities table
-- Policy: Users can only see their own city selections
CREATE POLICY "Users can view own world clock cities" ON user_world_clock_cities
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own city selections
CREATE POLICY "Users can insert own world clock cities" ON user_world_clock_cities
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own city selections
CREATE POLICY "Users can update own world clock cities" ON user_world_clock_cities
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own city selections
CREATE POLICY "Users can delete own world clock cities" ON user_world_clock_cities
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON POLICY "Users can view own timezones" ON user_timezones IS 'RLS policy: Users can only view their own timezone configurations';
COMMENT ON POLICY "Users can insert own timezones" ON user_timezones IS 'RLS policy: Users can only insert timezone configurations for themselves';
COMMENT ON POLICY "Users can update own timezones" ON user_timezones IS 'RLS policy: Users can only update their own timezone configurations';
COMMENT ON POLICY "Users can delete own timezones" ON user_timezones IS 'RLS policy: Users can only delete their own timezone configurations';

COMMENT ON POLICY "Users can view own world clock cities" ON user_world_clock_cities IS 'RLS policy: Users can only view their own city selections';
COMMENT ON POLICY "Users can insert own world clock cities" ON user_world_clock_cities IS 'RLS policy: Users can only insert city selections for themselves';
COMMENT ON POLICY "Users can update own world clock cities" ON user_world_clock_cities IS 'RLS policy: Users can only update their own city selections';
COMMENT ON POLICY "Users can delete own world clock cities" ON user_world_clock_cities IS 'RLS policy: Users can only delete their own city selections';

-- Fix function search path warnings by setting explicit search_path for all functions
-- This prevents security issues with mutable search paths

-- Drop existing functions that might have different signatures
-- Use CASCADE for functions that have dependencies
DROP FUNCTION IF EXISTS delete_user_completely(UUID);
DROP FUNCTION IF EXISTS log_user_action(TEXT, JSONB);
DROP FUNCTION IF EXISTS log_security_event(TEXT, JSONB);
DROP FUNCTION IF EXISTS schedule_account_deletion(UUID);
DROP FUNCTION IF EXISTS generate_recovery_token();
DROP FUNCTION IF EXISTS is_current_user_admin() CASCADE;
DROP FUNCTION IF EXISTS delete_my_account();
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Update trigger functions with explicit search_path
CREATE OR REPLACE FUNCTION update_user_timezones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_user_world_clock_cities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_session_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_active = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION generate_recovery_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION schedule_account_deletion(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Schedule account deletion logic
    UPDATE users 
    SET scheduled_deletion_at = now() + interval '30 days',
        updated_at = now()
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION log_user_action(
    action_type TEXT,
    action_details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action_type,
        action_details,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        action_type,
        action_details,
        current_setting('request.headers')::json->>'x-forwarded-for',
        current_setting('request.headers')::json->>'user-agent'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION log_security_event(
    event_type TEXT,
    event_details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action_type,
        action_details,
        severity
    ) VALUES (
        auth.uid(),
        event_type,
        event_details,
        'security'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION delete_user_completely(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Delete all user data
    DELETE FROM user_timezones WHERE user_id = user_uuid;
    DELETE FROM user_world_clock_cities WHERE user_id = user_uuid;
    DELETE FROM user_preferences WHERE user_id = user_uuid;
    DELETE FROM json_snippets WHERE user_id = user_uuid;
    DELETE FROM jwt_snippets WHERE user_id = user_uuid;
    DELETE FROM image_compression_jobs WHERE user_id = user_uuid;
    DELETE FROM blogs WHERE author_id = user_uuid;
    DELETE FROM users WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS VOID AS $$
BEGIN
    PERFORM delete_user_completely(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Set default values for new users
    NEW.created_at = now();
    NEW.updated_at = now();
    NEW.plan = COALESCE(NEW.plan, 'free');
    NEW.is_admin = COALESCE(NEW.is_admin, false);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate blog policies that were dropped by CASCADE
-- These policies depend on the is_current_user_admin() function
CREATE POLICY "blogs_select_admin" ON blogs
    FOR SELECT
    USING (is_current_user_admin());

CREATE POLICY "blogs_insert_admin" ON blogs
    FOR INSERT
    WITH CHECK (is_current_user_admin());

CREATE POLICY "blogs_update_admin" ON blogs
    FOR UPDATE
    USING (is_current_user_admin())
    WITH CHECK (is_current_user_admin());

CREATE POLICY "blogs_delete_admin" ON blogs
    FOR DELETE
    USING (is_current_user_admin());

-- Recreate auth trigger that was dropped by CASCADE
-- This trigger handles new user creation in the auth.users table
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
