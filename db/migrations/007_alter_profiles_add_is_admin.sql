-- Add is_admin flag to profiles/users table if not present
-- Detect target table: prefer public.users (existing in project) as app profile store

DO $$
BEGIN
  -- Add column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- Optional index for queries
CREATE INDEX IF NOT EXISTS users_is_admin_idx ON public.users(is_admin);

