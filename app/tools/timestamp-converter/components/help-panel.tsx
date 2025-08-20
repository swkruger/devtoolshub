"use client"

import { useState } from "react"
import { HelpCircle, X, Keyboard, Clock, Calendar, Globe, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface HelpPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpPanel({ isOpen, onClose }: HelpPanelProps) {


  const copyShortcut = (shortcut: string) => {
    navigator.clipboard.writeText(shortcut)
    toast.success("Copied!", {
      description: `Shortcut "${shortcut}" copied to clipboard`
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            <CardTitle>Timestamp Converter Help</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          <Tabs defaultValue="examples" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            </TabsList>

            <TabsContent value="examples" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Timestamp Examples
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">Unix Timestamp (seconds)</Badge>
                        <span className="text-xs text-gray-500">Standard format</span>
                      </div>
                      <div className="font-mono text-sm">
                        <div>Input: <span className="text-blue-600">1704110400</span></div>
                        <div>Output: <span className="text-green-600">2024-01-01T12:00:00Z</span></div>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">Unix Timestamp (milliseconds)</Badge>
                        <span className="text-xs text-gray-500">JavaScript Date.now()</span>
                      </div>
                      <div className="font-mono text-sm">
                        <div>Input: <span className="text-blue-600">1704110400000</span></div>
                        <div>Output: <span className="text-green-600">2024-01-01T12:00:00.000Z</span></div>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">ISO 8601 Date</Badge>
                        <span className="text-xs text-gray-500">Standard date format</span>
                      </div>
                      <div className="font-mono text-sm">
                        <div>Input: <span className="text-blue-600">2024-01-01T12:00:00Z</span></div>
                        <div>Output: <span className="text-green-600">1704110400</span></div>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">Local Date String</Badge>
                        <span className="text-xs text-gray-500">Human readable</span>
                      </div>
                      <div className="font-mono text-sm">
                        <div>Input: <span className="text-blue-600">January 1, 2024 12:00 PM</span></div>
                        <div>Output: <span className="text-green-600">1704110400</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Timezone Examples
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="font-mono text-sm space-y-1">
                        <div><span className="text-gray-600">UTC:</span> 2024-01-01T12:00:00Z</div>
                        <div><span className="text-gray-600">New York:</span> 2024-01-01T07:00:00-05:00</div>
                        <div><span className="text-gray-600">London:</span> 2024-01-01T12:00:00+00:00</div>
                        <div><span className="text-gray-600">Tokyo:</span> 2024-01-01T21:00:00+09:00</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Format Examples
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="font-mono text-sm space-y-1">
                        <div><span className="text-gray-600">ISO 8601:</span> 2024-01-01T12:00:00Z</div>
                        <div><span className="text-gray-600">Locale:</span> 1/1/2024, 12:00:00 PM</div>
                        <div><span className="text-gray-600">YYYY-MM-DD:</span> 2024-01-01 12:00:00</div>
                        <div><span className="text-gray-600">US Format:</span> 01/01/2024 12:00 PM</div>
                        <div><span className="text-gray-600">European:</span> 01.01.2024 12:00</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shortcuts" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Keyboard className="h-5 w-5" />
                    Keyboard Shortcuts
                  </h3>
                  <div className="space-y-2">
                    {[
                      { key: "F1", description: "Toggle this help panel", category: "General" },
                      { key: "Ctrl+L", description: "Load sample timestamp", category: "Actions" },
                      { key: "Ctrl+R", description: "Clear all inputs", category: "Actions" },
                      { key: "Ctrl+C", description: "Copy current result", category: "Copy" },
                      { key: "Ctrl+V", description: "Paste and convert timestamp", category: "Paste" },
                      { key: "Enter", description: "Trigger conversion", category: "Actions" },
                      { key: "Escape", description: "Clear all fields", category: "Actions" },
                      { key: "Space", description: "Toggle auto-update (Current & Compare tab)", category: "Current Time" },
                      { key: "Ctrl+Shift+C", description: "Copy all batch results", category: "Premium", premium: true },
                      { key: "Ctrl+Shift+E", description: "Export batch results", category: "Premium", premium: true }
                    ].map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={shortcut.premium ? "default" : "secondary"}
                            className="font-mono text-xs min-w-[100px] justify-center flex items-center gap-1"
                          >
                            {shortcut.premium && <Crown className="w-3 h-3" />} {shortcut.key}
                          </Badge>
                          <span className="text-sm">{shortcut.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {shortcut.category}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyShortcut(shortcut.key)}
                            className="h-6 w-6 p-0"
                          >
                            📋
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">💡 Usage Tips</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Automatic Detection</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        The tool automatically detects whether your input is a Unix timestamp (10 or 13 digits) or a date string and converts accordingly.
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Bidirectional Conversion</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Enter a timestamp in either field - the other field will automatically update with the converted value.
                      </p>
                    </div>

                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">Timezone Awareness</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Select different timezones to see how the same timestamp appears in different regions. UTC is the default and most reliable.
                      </p>
                    </div>

                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-1">Precision Handling</h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        10-digit numbers are treated as seconds, 13-digit numbers as milliseconds. The tool preserves precision automatically.
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">Common Use Cases</h4>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 mt-2">
                        <li>• Converting API timestamps to readable dates</li>
                        <li>• Converting log timestamps for debugging</li>
                        <li>• Scheduling events across timezones</li>
                        <li>• Database timestamp conversion</li>
                        <li>• Analyzing historical data with timestamps</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="accessibility" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">♿ Accessibility Features</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">Screen Reader Support</h4>
                      <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• All inputs have descriptive ARIA labels</li>
                        <li>• Conversion results are announced when updated</li>
                        <li>• Error messages are read aloud immediately</li>
                        <li>• Button purposes are clearly described</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">Keyboard Navigation</h4>
                      <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• Tab through all interactive elements</li>
                        <li>• Enter key triggers conversions</li>
                        <li>• Escape key clears fields and closes dialogs</li>
                        <li>• Arrow keys navigate between tabs</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">Visual Accessibility</h4>
                      <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• High contrast colors for better readability</li>
                        <li>• Clear focus indicators on all interactive elements</li>
                        <li>• Error messages with distinct styling</li>
                        <li>• Large click targets for easier interaction</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">Cognitive Accessibility</h4>
                      <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• Clear, simple language in all instructions</li>
                        <li>• Logical tab order and navigation flow</li>
                        <li>• Consistent button placement and behavior</li>
                        <li>• Helpful examples and format hints</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}