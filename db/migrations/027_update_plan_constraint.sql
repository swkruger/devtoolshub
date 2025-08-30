-- Update plan constraint from 'premium' to 'backer'
-- First, update existing 'premium' records to 'backer'
UPDATE users SET plan = 'backer' WHERE plan = 'premium';

-- Drop the old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;

-- Add the new constraint
ALTER TABLE users ADD CONSTRAINT users_plan_check CHECK (plan IN ('free', 'backer'));

-- Update the default value if needed
ALTER TABLE users ALTER COLUMN plan SET DEFAULT 'free';
