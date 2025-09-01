-- Rollback: Fix Delete User Function
-- Created: 2025-01-27
-- Description: Rollback the fix for delete_user_completely function

-- Drop the corrected functions
DROP FUNCTION IF EXISTS delete_user_completely(UUID);
DROP FUNCTION IF EXISTS delete_my_account(TEXT);

-- Recreate the original (incorrect) functions
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_my_account() TO authenticated;
