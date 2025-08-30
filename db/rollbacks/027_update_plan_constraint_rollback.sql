-- Rollback: Update plan constraint back to 'premium'
-- First, update existing 'backer' records back to 'premium'
UPDATE users SET plan = 'premium' WHERE plan = 'backer';

-- Drop the new constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;

-- Add the old constraint back
ALTER TABLE users ADD CONSTRAINT users_plan_check CHECK (plan IN ('free', 'premium'));

-- Update the default value back
ALTER TABLE users ALTER COLUMN plan SET DEFAULT 'free';
