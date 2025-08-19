-- Add stripe_customer_id column to users table
ALTER TABLE public.users 
ADD COLUMN stripe_customer_id TEXT;

-- Create index for faster lookups
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);

-- Add comment for documentation
COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe customer ID for subscription management';
