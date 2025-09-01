-- Migration: Fix User Creation Trigger
-- Created: 2025-01-27
-- Description: Fix the handle_new_user() function that was incorrectly redefined in RLS migration

-- Drop the incorrect trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create the correct handle_new_user function that actually inserts user records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new user record into public.users table
  INSERT INTO public.users (id, email, name, avatar_url, plan, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'preferred_username',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NEW.raw_user_meta_data->>'image'
    ),
    'free',
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a new user profile in public.users table when a new auth user is created via OAuth';
