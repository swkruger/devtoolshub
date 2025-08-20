-- Fix JSON concatenation issue in delete_my_account function
-- The issue was using || operator with JSON instead of JSONB

-- Drop and recreate the delete_my_account function with proper JSON concatenation
DROP FUNCTION IF EXISTS delete_my_account(TEXT);

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
    
    -- If successful, add sign out flag using proper JSONB concatenation
    IF (result->>'success')::BOOLEAN THEN
        result := (result::jsonb || jsonb_build_object('sign_out_required', true))::json;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_my_account(TEXT) TO authenticated;
