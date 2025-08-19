-- Rollback: Drop audit logs table
-- This will remove the audit_logs table and all associated objects

-- Drop functions first
DROP FUNCTION IF EXISTS log_security_event(uuid, text, jsonb, inet, text);
DROP FUNCTION IF EXISTS log_user_action(uuid, text, text, text, jsonb, inet, text, text);

-- Drop table (this will also drop indexes and policies)
DROP TABLE IF EXISTS public.audit_logs;
