-- Rollback script for users table migration
-- WARNING: This will delete all user data!

-- Drop trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop indexes
DROP INDEX IF EXISTS users_plan_idx;
DROP INDEX IF EXISTS users_created_at_idx;

-- Drop policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Drop trigger and function for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop users table
DROP TABLE IF EXISTS users; 