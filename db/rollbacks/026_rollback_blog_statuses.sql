-- Rollback: Revert blog statuses to original constraint
-- This migration reverts the status constraint back to the original statuses

-- Drop the new constraint
ALTER TABLE public.blogs 
DROP CONSTRAINT IF EXISTS blogs_status_check;

-- Add back the original constraint
ALTER TABLE public.blogs 
ADD CONSTRAINT blogs_status_check 
CHECK (status IN ('draft', 'published'));

-- Update comment back to original
COMMENT ON COLUMN public.blogs.status IS 'Blog status: draft or published';
