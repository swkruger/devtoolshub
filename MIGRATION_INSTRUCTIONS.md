# JSON Snippets Migration Instructions

## Required Database Migration

To enable the JSON snippets functionality, you need to run the database migration in your Supabase project.

### Steps:

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run the Migration**
   - Copy the contents of `db/migrations/002_create_json_snippets_table.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute the migration

3. **Verify Migration**
   - Go to Table Editor
   - Confirm `json_snippets` table was created
   - Verify the table has all expected columns and indexes

### Migration Contents:

The migration creates:
- `json_snippets` table with proper foreign key relationships
- Row Level Security (RLS) policies for user data isolation
- Optimized indexes for performance
- Auto-updating timestamp triggers

### Rollback (if needed):

If you need to rollback this migration:
- Copy contents of `db/rollbacks/002_rollback_json_snippets_table.sql`
- Run in SQL Editor

### Security Features:

- **RLS Enabled**: Users can only access their own snippets
- **Cascade Delete**: Snippets are automatically deleted when user is deleted
- **Input Validation**: Database constraints ensure data integrity

Once this migration is complete, premium users will be able to:
- Save JSON snippets with names and categories
- Load saved snippets into the editor
- Organize snippets by categories
- Mark snippets as favorites
- Search through saved snippets

### Troubleshooting:

If you encounter errors:
1. Ensure you have proper database permissions
2. Check that the `users` table exists (from migration 001)
3. Verify the `update_updated_at_column()` function exists
4. Contact support if issues persist 