-- Rollback: Drop account deletions table
-- This will remove the account_deletions table and all associated objects

-- Drop functions first
DROP FUNCTION IF EXISTS schedule_account_deletion(uuid, text);
DROP FUNCTION IF EXISTS generate_recovery_token();

-- Drop table (this will also drop indexes and policies)
DROP TABLE IF EXISTS public.account_deletions;
