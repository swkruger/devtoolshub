-- Rollback: Drop image compression tables
-- Date: 2024-12-28
-- Description: Remove tables for compression history, favorite settings, and user preferences

-- Drop triggers first
DROP TRIGGER IF EXISTS update_image_compression_preferences_updated_at ON image_compression_preferences;
DROP TRIGGER IF EXISTS update_image_compression_favorites_updated_at ON image_compression_favorites;
DROP TRIGGER IF EXISTS update_image_compression_history_updated_at ON image_compression_history;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_image_compression_analytics_created_at;
DROP INDEX IF EXISTS idx_image_compression_analytics_user_id;
DROP INDEX IF EXISTS idx_image_compression_preferences_user_id;
DROP INDEX IF EXISTS idx_image_compression_favorites_user_id;
DROP INDEX IF EXISTS idx_image_compression_history_created_at;
DROP INDEX IF EXISTS idx_image_compression_history_user_id;

-- Drop tables
DROP TABLE IF EXISTS image_compression_analytics;
DROP TABLE IF EXISTS image_compression_preferences;
DROP TABLE IF EXISTS image_compression_favorites;
DROP TABLE IF EXISTS image_compression_history; 