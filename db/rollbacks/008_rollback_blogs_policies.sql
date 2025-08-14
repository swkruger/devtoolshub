-- Rollback for 008_blogs_policies.sql

-- Drop policies
DROP POLICY IF EXISTS blogs_select_published ON public.blogs;
DROP POLICY IF EXISTS blogs_select_admin ON public.blogs;
DROP POLICY IF EXISTS blogs_insert_admin ON public.blogs;
DROP POLICY IF EXISTS blogs_update_admin ON public.blogs;
DROP POLICY IF EXISTS blogs_delete_admin ON public.blogs;

-- Optionally disable RLS (keep enabled to be safe)
-- ALTER TABLE public.blogs DISABLE ROW LEVEL SECURITY;

-- Drop helper function
DROP FUNCTION IF EXISTS public.is_current_user_admin();

