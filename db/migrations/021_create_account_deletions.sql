-- Migration: Create account deletions table
-- This table tracks account deletion requests with grace period

CREATE TABLE public.account_deletions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deletion_requested_at timestamptz NOT NULL DEFAULT now(),
    deletion_scheduled_at timestamptz NOT NULL,
    deletion_reason text,
    data_exported boolean DEFAULT false,
    recovery_token text UNIQUE,
    is_cancelled boolean DEFAULT false,
    cancelled_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_account_deletions_user_id ON public.account_deletions(user_id);
CREATE INDEX idx_account_deletions_scheduled_at ON public.account_deletions(deletion_scheduled_at);
CREATE INDEX idx_account_deletions_recovery_token ON public.account_deletions(recovery_token);

-- Enable RLS
ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own deletion requests" ON public.account_deletions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deletion requests" ON public.account_deletions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deletion requests" ON public.account_deletions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deletion requests" ON public.account_deletions
    FOR DELETE USING (auth.uid() = user_id);

-- Function to generate recovery token
CREATE OR REPLACE FUNCTION generate_recovery_token()
RETURNS text AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to schedule account deletion (30 days grace period)
CREATE OR REPLACE FUNCTION schedule_account_deletion(user_uuid uuid, reason text DEFAULT NULL)
RETURNS text AS $$
DECLARE
    recovery_tok text;
BEGIN
    -- Generate recovery token
    recovery_tok := generate_recovery_token();
    
    -- Insert deletion request with 30-day grace period
    INSERT INTO public.account_deletions (
        user_id,
        deletion_scheduled_at,
        deletion_reason,
        recovery_token
    ) VALUES (
        user_uuid,
        now() + interval '30 days',
        reason,
        recovery_tok
    );
    
    RETURN recovery_tok;
END;
$$ LANGUAGE plpgsql;
