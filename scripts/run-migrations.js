const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  console.log('Running database migrations...')
  
  const migrationsDir = path.join(__dirname, '..', 'db', 'migrations')
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort() // Ensure migrations run in order
  
  for (const file of migrationFiles) {
    console.log(`Running migration: ${file}`)
    
    try {
      const migrationPath = path.join(migrationsDir, file)
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
      
      const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
      
      if (error) {
        console.error(`Error running migration ${file}:`, error)
        process.exit(1)
      }
      
      console.log(`✅ Migration ${file} completed successfully`)
    } catch (err) {
      console.error(`Error running migration ${file}:`, err)
      process.exit(1)
    }
  }
  
  console.log('🎉 All migrations completed successfully!')
}

runMigrations().catch(console.error)
