#!/usr/bin/env node

/**
 * Test script to debug settings page issues
 * Run with: node scripts/test-settings-page.js
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function testSettingsPage() {
  console.log('🔍 Testing Settings Page Configuration...\n')

  // Check environment variables
  console.log('📋 Environment Variables:')
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL'
  ]

  let envVarsOk = true
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar]
    const status = value ? '✅' : '❌'
    const displayValue = value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : 'MISSING'
    console.log(`  ${status} ${envVar}: ${displayValue}`)
    if (!value) envVarsOk = false
  }

  if (!envVarsOk) {
    console.log('\n❌ Missing required environment variables. Please check your .env.local file.')
    return
  }

  console.log('\n🔗 Testing Supabase Connection...')

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.log(`❌ Database connection failed: ${error.message}`)
      return
    }

    console.log('✅ Database connection successful')

    // Test if user_preferences table exists
    const { data: prefsData, error: prefsError } = await supabase
      .from('user_preferences')
      .select('count')
      .limit(1)

    if (prefsError) {
      console.log(`⚠️  user_preferences table issue: ${prefsError.message}`)
    } else {
      console.log('✅ user_preferences table accessible')
    }

    console.log('\n✅ Settings page configuration appears to be correct!')
    console.log('\n💡 If you\'re still having issues:')
    console.log('   1. Check Vercel environment variables are set correctly')
    console.log('   2. Verify Supabase RLS policies allow access to user_preferences table')
    console.log('   3. Check browser console for JavaScript errors')
    console.log('   4. Verify user authentication is working properly')

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`)
  }
}

// Run the test
testSettingsPage().catch(console.error)
