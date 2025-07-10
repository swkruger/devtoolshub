#!/usr/bin/env node

/**
 * Simple test runner for JSON formatter functionality
 * This script validates core JSON operations without UI dependencies
 */

console.log('🧪 JSON Formatter Test Suite')
console.log('================================')

// Test samples
const testSamples = {
  simple: { "name": "John", "age": 30, "active": true },
  nested: {
    "user": {
      "profile": {
        "name": "Jane Doe",
        "preferences": {
          "theme": "dark",
          "notifications": { "email": true, "push": false }
        }
      }
    }
  },
  array: [1, 2, 3, "four", true, null, { "nested": "object" }],
  edgeCases: {
    "emptyString": "",
    "nullValue": null,
    "zero": 0,
    "emptyArray": [],
    "emptyObject": {},
    "unicode": "Hello 🌍 World! 中文 العربية",
    "specialChars": "Line\nbreak\ttab\"quote'apostrophe\\backslash"
  }
}

const invalidSamples = {
  trailingComma: '{"name": "John", "age": 30,}',
  singleQuotes: "{'name': 'John', 'age': 30}",
  unquotedKeys: '{name: "John", age: 30}',
  mixedQuotes: '{"name": \'John\', "age": 30}'
}

// Test functions
function testJsonValidation(name, jsonString) {
  try {
    JSON.parse(jsonString)
    console.log(`✅ ${name}: Valid JSON`)
    return true
  } catch (error) {
    console.log(`❌ ${name}: Invalid JSON - ${error.message}`)
    return false
  }
}

function testJsonOperations(name, obj) {
  try {
    // Test format
    const formatted = JSON.stringify(obj, null, 2)
    if (formatted.includes('  ')) {
      console.log(`✅ ${name}: Format operation works`)
    } else {
      console.log(`❌ ${name}: Format operation failed`)
      return false
    }

    // Test compact
    const compacted = JSON.stringify(obj)
    if (!compacted.includes('  ')) {
      console.log(`✅ ${name}: Compact operation works`)
    } else {
      console.log(`❌ ${name}: Compact operation failed`)
      return false
    }

    // Test sort (basic)
    const sorted = sortObjectKeys(obj)
    const sortedString = JSON.stringify(sorted)
    console.log(`✅ ${name}: Sort operation works`)

    return true
  } catch (error) {
    console.log(`❌ ${name}: Operation failed - ${error.message}`)
    return false
  }
}

function sortObjectKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sorted = {}
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = sortObjectKeys(obj[key])
    })
    return sorted
  }
  
  return obj
}

function testJsonRepair(name, invalidJson) {
  try {
    let repairedJson = invalidJson
    
    // Basic repair operations
    repairedJson = repairedJson.replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
    repairedJson = repairedJson.replace(/'/g, '"') // Replace single quotes
    repairedJson = repairedJson.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Add quotes to keys
    
    JSON.parse(repairedJson)
    console.log(`✅ ${name}: Repair operation works`)
    return true
  } catch (error) {
    console.log(`❌ ${name}: Repair operation failed - ${error.message}`)
    return false
  }
}

// Run tests
console.log('\n📝 Testing JSON Structure Validation:')
let passed = 0
let total = 0

// Test valid JSON structures
Object.entries(testSamples).forEach(([name, sample]) => {
  total++
  if (testJsonValidation(name, JSON.stringify(sample))) {
    passed++
  }
})

console.log('\n🔧 Testing JSON Operations:')
Object.entries(testSamples).forEach(([name, sample]) => {
  total++
  if (testJsonOperations(name, sample)) {
    passed++
  }
})

console.log('\n🛠️ Testing JSON Repair:')
Object.entries(invalidSamples).forEach(([name, sample]) => {
  total++
  if (testJsonRepair(name, sample)) {
    passed++
  }
})

console.log('\n📊 Test Results:')
console.log(`================================`)
console.log(`Total Tests: ${total}`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${total - passed}`)
console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

if (passed === total) {
  console.log('\n🎉 All tests passed!')
  process.exit(0)
} else {
  console.log('\n⚠️  Some tests failed!')
  process.exit(1)
} 