-- Function to delete a user and all their data
-- This function should be called with admin privileges
CREATE OR REPLACE FUNCTION delete_user_completely(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    deletion_results JSON;
    user_email TEXT;
    deleted_tables TEXT[] := ARRAY[]::TEXT[];
    affected_rows INTEGER;
BEGIN
    -- Get user email for logging
    SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;
    
    -- Delete from known tables that might have foreign keys to users
    -- Delete from blogs table (if exists)
    BEGIN
        DELETE FROM public.blogs WHERE author_id = user_uuid;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        IF affected_rows > 0 THEN
            deleted_tables := array_append(deleted_tables, 'blogs');
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Table might not exist
        NULL;
    END;
    
    -- Delete from any other tables that might reference users
    -- Add more tables here as needed
    
    -- Delete from user_sessions
    BEGIN
        DELETE FROM public.user_sessions WHERE user_id = user_uuid;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        IF affected_rows > 0 THEN
            deleted_tables := array_append(deleted_tables, 'user_sessions');
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    -- Delete from user_notification_preferences
    BEGIN
        DELETE FROM public.user_notification_preferences WHERE user_id = user_uuid;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        IF affected_rows > 0 THEN
            deleted_tables := array_append(deleted_tables, 'user_notification_preferences');
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    -- Delete from user_preferences
    BEGIN
        DELETE FROM public.user_preferences WHERE user_id = user_uuid;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        IF affected_rows > 0 THEN
            deleted_tables := array_append(deleted_tables, 'user_preferences');
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    -- Delete from account_deletions
    BEGIN
        DELETE FROM public.account_deletions WHERE user_id = user_uuid;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        IF affected_rows > 0 THEN
            deleted_tables := array_append(deleted_tables, 'account_deletions');
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    -- Delete from audit_logs
    BEGIN
        DELETE FROM public.audit_logs WHERE user_id = user_uuid;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        IF affected_rows > 0 THEN
            deleted_tables := array_append(deleted_tables, 'audit_logs');
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    -- Finally delete from users table
    BEGIN
        DELETE FROM public.users WHERE id = user_uuid;
        deleted_tables := array_append(deleted_tables, 'users');
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to delete from users table: %', SQLERRM;
    END;
    
    -- Delete from auth.users (requires admin privileges)
    BEGIN
        DELETE FROM auth.users WHERE id = user_uuid;
        deleted_tables := array_append(deleted_tables, 'auth.users');
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error deleting from auth.users: %', SQLERRM;
    END;
    
    -- Create deletion results JSON
    deletion_results := json_build_object(
        'deleted_tables', deleted_tables,
        'total_tables_deleted', array_length(deleted_tables, 1)
    );
    
    -- Log the deletion (if audit_logs table still exists and we can insert)
    BEGIN
        INSERT INTO public.audit_logs (user_id, event_type, event_details, created_at)
        VALUES (
            user_uuid,
            'account_deleted_completely',
            json_build_object(
                'deletion_results', deletion_results,
                'deleted_email', user_email,
                'deleted_at', NOW()
            ),
            NOW()
        );
    EXCEPTION WHEN OTHERS THEN
        -- Ignore audit log insertion errors since we're deleting the user
        NULL;
    END;
    
    RETURN json_build_object(
        'success', true,
        'message', 'User deleted completely',
        'user_id', user_uuid,
        'user_email', user_email,
        'deletion_results', deletion_results,
        'deleted_at', NOW()
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'user_id', user_uuid,
        'user_email', user_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO authenticated;

-- Create a wrapper function that can be called from the API
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
        result := result || json_build_object('sign_out_required', true);
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_my_account(TEXT) TO authenticated;
