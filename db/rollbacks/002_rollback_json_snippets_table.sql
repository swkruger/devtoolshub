-- Rollback script for json_snippets table

-- Drop indexes
DROP INDEX IF EXISTS json_snippets_user_category_created_idx;
DROP INDEX IF EXISTS json_snippets_name_idx;
DROP INDEX IF EXISTS json_snippets_created_at_idx;
DROP INDEX IF EXISTS json_snippets_is_favorite_idx;
DROP INDEX IF EXISTS json_snippets_category_idx;
DROP INDEX IF EXISTS json_snippets_user_id_idx;

-- Drop policies
DROP POLICY IF EXISTS "Users can delete own snippets" ON json_snippets;
DROP POLICY IF EXISTS "Users can update own snippets" ON json_snippets;
DROP POLICY IF EXISTS "Users can insert own snippets" ON json_snippets;
DROP POLICY IF EXISTS "Users can view own snippets" ON json_snippets;

-- Drop trigger
DROP TRIGGER IF EXISTS update_json_snippets_updated_at ON json_snippets;

-- Drop table
DROP TABLE IF EXISTS json_snippets; 