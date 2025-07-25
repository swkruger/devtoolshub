-- Rollback JWT snippets table
-- Drop trigger first
DROP TRIGGER IF EXISTS update_jwt_snippets_updated_at ON jwt_snippets;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_jwt_snippets_user_id;
DROP INDEX IF EXISTS idx_jwt_snippets_created_at;
DROP INDEX IF EXISTS idx_jwt_snippets_is_favorite;

-- Drop table
DROP TABLE IF EXISTS jwt_snippets; 