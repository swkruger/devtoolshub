-- Rollback: Drop user preferences table
-- This will remove the user_preferences table and all associated objects

-- Drop trigger first
DROP TRIGGER IF EXISTS update_user_preferences_updated_at_trigger ON public.user_preferences;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_user_preferences_updated_at();

-- Drop table (this will also drop indexes and policies)
DROP TABLE IF EXISTS public.user_preferences;
