"use client"

import { useState, useEffect } from "react"
import { getToolById } from "@/lib/tools"
import { authClient } from "@/lib/auth"
import { FileJson, ArrowLeft, TestTube } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { JsonEditor } from "../components/json-editor"
import { JsonTester } from "../components/json-tester"
import Link from "next/link"

export default function JsonFormatterTestPage() {
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [userId, setUserId] = useState<string | undefined>(undefined)

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const authUser = await authClient.getUser()
        if (authUser) {
          const userProfile = await authClient.getUserProfile(authUser.id)
          setIsPremiumUser(userProfile?.plan === 'premium')
          setUserId(authUser.id)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      }
    }
    loadUser()
  }, [])

  // Test interface functions
  const handleTestJson = (json: string) => {
    try {
      JSON.parse(json)
      return { isValid: true }
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  const handleTestOperation = async (operation: string, json: string) => {
    try {
      const parsed = JSON.parse(json)
      
      switch (operation) {
        case 'format':
          return {
            success: true,
            result: JSON.stringify(parsed, null, 2)
          }
        case 'compact':
          return {
            success: true,
            result: JSON.stringify(parsed)
          }
        case 'sort':
          const sorted = sortObjectKeys(parsed)
          return {
            success: true,
            result: JSON.stringify(sorted, null, 2)
          }
        case 'repair':
          // Basic repair test - try to fix and parse
          let repairedJson = json
          // Remove trailing commas
          repairedJson = repairedJson.replace(/,(\s*[}\]])/g, '$1')
          // Replace single quotes with double quotes
          repairedJson = repairedJson.replace(/'/g, '"')
          
          const repaired = JSON.parse(repairedJson)
          return {
            success: true,
            result: JSON.stringify(repaired, null, 2)
          }
        default:
          throw new Error(`Unknown operation: ${operation}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Helper function to sort object keys
  const sortObjectKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys)
    }
    
    if (obj !== null && typeof obj === 'object') {
      const sorted: any = {}
      Object.keys(obj).sort().forEach(key => {
        sorted[key] = sortObjectKeys(obj[key])
      })
      return sorted
    }
    
    return obj
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <TestTube className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              JSON Formatter - Test Suite
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comprehensive testing of JSON formatter functionality
            </p>
          </div>
        </div>
        
        <Link href="/tools/json-formatter">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Button>
        </Link>
      </div>

      {/* Test Component */}
      <JsonTester
        isPremiumUser={isPremiumUser}
        onTestJson={handleTestJson}
        onTestOperation={handleTestOperation}
      />

      {/* Interactive Test Editor */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              Interactive Test Editor
            </CardTitle>
            <CardDescription>
              Use this editor to manually test specific JSON structures and operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JsonEditor 
              isPremiumUser={isPremiumUser} 
              userId={userId}
            />
          </CardContent>
        </Card>
      </div>

      {/* Test Instructions */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Manual Testing Instructions</CardTitle>
            <CardDescription>
              Additional tests that require manual verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">🖥️ Responsive Design Testing</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Test on desktop (1920x1080+): Toolbar should display in full width</li>
                  <li>• Test on tablet (768x1024): Toolbar buttons should wrap appropriately</li>
                  <li>• Test on mobile (375x667): Toolbar should stack vertically if needed</li>
                  <li>• Verify editor height adapts to screen size</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm mb-2">👑 Premium Feature Testing</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• As free user: Premium buttons should show crown icon and upgrade prompt</li>
                  <li>• As premium user: Premium buttons should be fully functional</li>
                  <li>• Test file upload drag & drop functionality</li>
                  <li>• Test file download with different JSON structures</li>
                  <li>• Test format conversion (JSON ↔ XML/CSV/YAML)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm mb-2">🔧 Performance Testing</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Test with large JSON files (50KB+): Should show performance warnings</li>
                  <li>• Test with very large JSON files (200KB+): Should show size warnings</li>
                  <li>• Test rapid typing: Should show "Validating..." indicator</li>
                  <li>• Test memory usage with multiple large files</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm mb-2">🛡️ Error Handling Testing</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Test with completely invalid JSON: Should show helpful error messages</li>
                  <li>• Test with network failures during snippet operations</li>
                  <li>• Test with browser memory limits</li>
                  <li>• Test recovery after error states</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 