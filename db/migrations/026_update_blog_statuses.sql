-- Update blog statuses to include new statuses: editing, rejected, ready to publish
-- This migration updates the status constraint to support the new workflow statuses

-- First, drop the existing constraint
ALTER TABLE public.blogs 
DROP CONSTRAINT IF EXISTS blogs_status_check;

-- Add the new constraint with all statuses
ALTER TABLE public.blogs 
ADD CONSTRAINT blogs_status_check 
CHECK (status IN ('draft', 'published', 'editing', 'rejected', 'ready to publish'));

-- Add comment to document the statuses
COMMENT ON COLUMN public.blogs.status IS 'Blog status: draft, published, editing, rejected, ready to publish';
