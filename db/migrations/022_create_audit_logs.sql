-- Migration: Create audit logs table
-- This table tracks user actions and security events for compliance

CREATE TABLE public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    resource_type text,
    resource_id text,
    details jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    session_id text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs(resource_type);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only admins can view audit logs)
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Function to log user actions
CREATE OR REPLACE FUNCTION log_user_action(
    user_uuid uuid,
    action_name text,
    resource_type text DEFAULT NULL,
    resource_id text DEFAULT NULL,
    action_details jsonb DEFAULT '{}',
    client_ip inet DEFAULT NULL,
    user_agent_text text DEFAULT NULL,
    session_id_text text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent,
        session_id
    ) VALUES (
        user_uuid,
        action_name,
        resource_type,
        resource_id,
        action_details,
        client_ip,
        user_agent_text,
        session_id_text
    );
END;
$$ LANGUAGE plpgsql;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    user_uuid uuid,
    event_type text,
    event_details jsonb DEFAULT '{}',
    client_ip inet DEFAULT NULL,
    user_agent_text text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    PERFORM log_user_action(
        user_uuid,
        'security_' || event_type,
        'security',
        NULL,
        event_details,
        client_ip,
        user_agent_text,
        NULL
    );
END;
$$ LANGUAGE plpgsql;
