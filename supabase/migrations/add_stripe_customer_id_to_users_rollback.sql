-- Rollback: Remove stripe_customer_id column from users table
DROP INDEX IF EXISTS idx_users_stripe_customer_id;
ALTER TABLE public.users DROP COLUMN IF EXISTS stripe_customer_id;
