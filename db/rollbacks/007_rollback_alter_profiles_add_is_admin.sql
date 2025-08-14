-- Rollback for 007_alter_profiles_add_is_admin.sql

DROP INDEX IF EXISTS public.users_is_admin_idx;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.users DROP COLUMN is_admin;
  END IF;
END $$;

