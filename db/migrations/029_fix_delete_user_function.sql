-- Migration: Fix Delete User Function
-- Created: 2025-01-27
-- Description: Fix the delete_user_completely function to reference correct table names and handle JSON errors

-- Drop the incorrect function
DROP FUNCTION IF EXISTS delete_user_completely(UUID);
DROP FUNCTION IF EXISTS delete_my_account(TEXT);

-- Create the corrected delete_user_completely function with proper table references and error handling
CREATE OR REPLACE FUNCTION delete_user_completely(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    deletion_results JSONB;
    user_email TEXT;
BEGIN
    -- Get user email for logging
    SELECT email INTO user_email FROM users WHERE id = user_uuid;
    
    -- Initialize deletion results
    deletion_results := '{}'::jsonb;
    
    -- Delete all user data from existing tables with error handling
    BEGIN
        DELETE FROM user_timezones WHERE user_id = user_uuid;
        deletion_results := deletion_results || jsonb_build_object('user_timezones', 'deleted');
    EXCEPTION WHEN OTHERS THEN
        -- Log error but continue with deletion
        RAISE WARNING 'Error deleting from user_timezones: %', SQLERRM;
        deletion_results := deletion_results || jsonb_build_object('user_timezones', 'error: ' || SQLERRM);
    END;

    BEGIN
        DELETE FROM user_world_clock_cities WHERE user_id = user_uuid;
        deletion_results := deletion_results || jsonb_build_object('user_world_clock_cities', 'deleted');
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error deleting from user_world_clock_cities: %', SQLERRM;
        deletion_results := deletion_results || jsonb_build_object('user_world_clock_cities', 'error: ' || SQLERRM);
    END;

    BEGIN
        DELETE FROM user_preferences WHERE user_id = user_uuid;
        deletion_results := deletion_results || jsonb_build_object('user_preferences', 'deleted');
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error deleting from user_preferences: %', SQLERRM;
        deletion_results := deletion_results || jsonb_build_object('user_preferences', 'error: ' || SQLERRM);
    END;

    BEGIN
        DELETE FROM json_snippets WHERE user_id = user_uuid;
        deletion_results := deletion_results || jsonb_build_object('json_snippets', 'deleted');
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error deleting from json_snippets: %', SQLERRM;
        deletion_results := deletion_results || jsonb_build_object('json_snippets', 'error: ' || SQLERRM);
    END;

    BEGIN
        DELETE FROM jwt_snippets WHERE user_id = user_uuid;
        deletion_results := deletion_results || jsonb_build_object('jwt_snippets', 'deleted');
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error deleting from jwt_snippets: %', SQLERRM;
        deletion_results := deletion_results || jsonb_build_object('jwt_snippets', 'error: ' || SQLERRM);
    END;
    
    -- Delete from image compression tables (using correct table names)
    BEGIN
        DELETE FROM image_compression_history WHERE user_id = user_uuid;
        deletion_results := deletion_results || jsonb_build_object('image_compression_history', 'deleted');
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error deleting from image_compression_history: %', SQLERRM;
        deletion_results := deletion_results || jsonb_build_object('image_compression_history', 'error: ' || SQLERRM);
    END;

    BEGIN
        DELETE FROM image_compression_favorites WHERE user_id = user_uuid;
        deletion_results := deletion_results || jsonb_build_object('image_compression_favorites', 'deleted');
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error deleting from image_compression_favorites: %', SQLERRM;
        deletion_results := deletion_results || jsonb_build_object('image_compression_favorites', 'error: ' || SQLERRM);
    END;

    BEGIN
        DELETE FROM image_compression_preferences WHERE user_id = user_uuid;
        deletion_results := deletion_results || jsonb_build_object('image_compression_preferences', 'deleted');
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error deleting from image_compression_preferences: %', SQLERRM;
        deletion_results := deletion_results || jsonb_build_object('image_compression_preferences', 'error: ' || SQLERRM);
    END;

    BEGIN
        DELETE FROM image_compression_analytics WHERE user_id = user_uuid;
        deletion_results := deletion_results || jsonb_build_object('image_compression_analytics', 'deleted');
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error deleting from image_compression_analytics: %', SQLERRM;
        deletion_results := deletion_results || jsonb_build_object('image_compression_analytics', 'error: ' || SQLERRM);
    END;
    
    -- Delete from other user-related tables
    BEGIN
        DELETE FROM blogs WHERE author_id = user_uuid;
        deletion_results := deletion_results || jsonb_build_object('blogs', 'deleted');
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error deleting from blogs: %', SQLERRM;
        deletion_results := deletion_results || jsonb_build_object('blogs', 'error: ' || SQLERRM);
    END;

    BEGIN
        DELETE FROM user_tool_favorites WHERE user_id = user_uuid;
        deletion_results := deletion_results || jsonb_build_object('user_tool_favorites', 'deleted');
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error deleting from user_tool_favorites: %', SQLERRM;
        deletion_results := deletion_results || jsonb_build_object('user_tool_favorites', 'error: ' || SQLERRM);
    END;

    -- Delete from audit logs last (to avoid interfering with deletion logging)
    BEGIN
        DELETE FROM audit_logs WHERE user_id = user_uuid;
        deletion_results := deletion_results || jsonb_build_object('audit_logs', 'deleted');
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error deleting from audit_logs: %', SQLERRM;
        deletion_results := deletion_results || jsonb_build_object('audit_logs', 'error: ' || SQLERRM);
    END;

    BEGIN
        DELETE FROM account_deletions WHERE user_id = user_uuid;
        deletion_results := deletion_results || jsonb_build_object('account_deletions', 'deleted');
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error deleting from account_deletions: %', SQLERRM;
        deletion_results := deletion_results || jsonb_build_object('account_deletions', 'error: ' || SQLERRM);
    END;
    
    -- Finally delete the user record
    BEGIN
        DELETE FROM users WHERE id = user_uuid;
        deletion_results := deletion_results || jsonb_build_object('users', 'deleted');
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to delete user record: %', SQLERRM;
    END;
    
    -- Return success with deletion results
    RETURN json_build_object(
        'success', true,
        'message', 'User deleted completely',
        'user_id', user_uuid,
        'user_email', user_email,
        'deletion_results', deletion_results,
        'deleted_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the delete_my_account function with proper signature and return type
CREATE OR REPLACE FUNCTION delete_my_account(reason TEXT DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    current_user_id UUID;
    result JSON;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    -- Call the deletion function
    result := delete_user_completely(current_user_id);
    
    -- If successful, add sign out flag
    IF (result->>'success')::BOOLEAN THEN
        result := (result::jsonb || jsonb_build_object('sign_out_required', true))::json;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_my_account(TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION delete_user_completely(UUID) IS 'Deletes all user data from all tables when a user account is deleted, with robust error handling for JSON fields';
COMMENT ON FUNCTION delete_my_account(TEXT) IS 'Allows authenticated users to delete their own account completely with optional reason';
