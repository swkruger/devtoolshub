-- RLS Policies for blogs

-- Helper: determine admin by joining to public.users (app profiles)
-- Note: Using a SECURITY DEFINER function to check admin status safely in RLS
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid uuid := auth.uid();
  is_admin_val boolean := false;
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;
  SELECT COALESCE(u.is_admin, false) INTO is_admin_val
  FROM public.users u
  WHERE u.id = uid;
  RETURN COALESCE(is_admin_val, false);
END;
$$;

-- Ensure RLS enabled
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- SELECT: allow public for published only
DROP POLICY IF EXISTS blogs_select_published ON public.blogs;
CREATE POLICY blogs_select_published ON public.blogs
  FOR SELECT
  USING (
    status = 'published'
  );

-- SELECT: allow admins for all rows
DROP POLICY IF EXISTS blogs_select_admin ON public.blogs;
CREATE POLICY blogs_select_admin ON public.blogs
  FOR SELECT
  USING (
    public.is_current_user_admin()
  );

-- INSERT: admins only (author_id must match auth.uid())
DROP POLICY IF EXISTS blogs_insert_admin ON public.blogs;
CREATE POLICY blogs_insert_admin ON public.blogs
  FOR INSERT
  WITH CHECK (
    public.is_current_user_admin() AND author_id = auth.uid()
  );

-- UPDATE: admins only
DROP POLICY IF EXISTS blogs_update_admin ON public.blogs;
CREATE POLICY blogs_update_admin ON public.blogs
  FOR UPDATE
  USING (
    public.is_current_user_admin()
  )
  WITH CHECK (
    public.is_current_user_admin()
  );

-- DELETE: admins only
DROP POLICY IF EXISTS blogs_delete_admin ON public.blogs;
CREATE POLICY blogs_delete_admin ON public.blogs
  FOR DELETE
  USING (
    public.is_current_user_admin()
  );

