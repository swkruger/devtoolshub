-- Rollback: Fix User Creation Trigger
-- Created: 2025-01-27
-- Description: Rollback the user creation trigger fix

-- Drop the correct trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Restore the incorrect function from RLS migration
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

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
