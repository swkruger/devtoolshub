"use client"

import { X, RotateCcw, FileText, Crown, Keyboard, Lightbulb, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface HelpPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Base64 Encoder/Decoder Help</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-0">
          <Tabs defaultValue="examples" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            </TabsList>

            <div className="max-h-[60vh] overflow-y-auto">
              <TabsContent value="examples" className="space-y-4 p-6">
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Text Encoding Examples
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">Simple Text</Badge>
                          <span className="text-xs text-gray-500">Basic encoding</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div><strong>Input:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Hello, World!</code></div>
                          <div><strong>Output:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">SGVsbG8sIFdvcmxkIQ==</code></div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">Unicode Text</Badge>
                          <span className="text-xs text-gray-500">UTF-8 encoding</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div><strong>Input:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">🌟 Hello! 中文</code></div>
                          <div><strong>Output:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">8J+MnyBIZWxsbyEg5Lit6YeH</code></div>
                        </div>
                      </div>

                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">URL-Safe Base64</Badge>
                          <div className="flex items-center gap-1">
                            <Crown className="h-3 w-3 text-amber-600" />
                            <span className="text-xs text-amber-600">Premium</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div><strong>Standard:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">A+B/C==</code></div>
                          <div><strong>URL-Safe:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">A-B_C</code></div>
                          <div className="text-xs text-amber-700 dark:text-amber-300">
                            Replaces + with -, / with _, and removes padding
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">Character Sets</Badge>
                          <div className="flex items-center gap-1">
                            <Crown className="h-3 w-3 text-amber-600" />
                            <span className="text-xs text-amber-600">Premium</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div><strong>UTF-8:</strong> Universal encoding (default)</div>
                          <div><strong>ASCII:</strong> 7-bit encoding for English text</div>
                          <div><strong>ISO-8859-1:</strong> Latin-1 Western European</div>
                          <div><strong>Windows-1252:</strong> Windows Western encoding</div>
                          <div className="text-xs text-blue-700 dark:text-blue-300">
                            Supports 18+ character sets including Asian encodings
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">Newline Separators</Badge>
                          <div className="flex items-center gap-1">
                            <Crown className="h-3 w-3 text-amber-600" />
                            <span className="text-xs text-amber-600">Premium</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div><strong>LF (Unix):</strong> <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">\n</code> - Linux/Mac standard</div>
                          <div><strong>CRLF (Windows):</strong> <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">\r\n</code> - Windows standard</div>
                          <div><strong>CR (Classic Mac):</strong> <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">\r</code> - Legacy Mac</div>
                          <div className="text-xs text-green-700 dark:text-green-300">
                            Automatically converts line endings during encoding/decoding
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <RotateCcw className="h-5 w-5" />
                      File Encoding Examples
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">Image File</Badge>
                          <span className="text-xs text-gray-500">Binary data</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div><strong>Input:</strong> image.png (Binary file)</div>
                          <div><strong>Output:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">iVBORw0KGgoAAAANSUhEUgAAA...</code></div>
                          <div className="text-xs text-gray-600">
                            Perfect for embedding images in HTML, CSS, or JSON
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">Document File</Badge>
                          <span className="text-xs text-gray-500">PDF, Word, etc.</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div><strong>Use Case:</strong> File attachment in APIs</div>
                          <div><strong>Example:</strong> Upload PDF → Base64 → Send via JSON</div>
                          <div className="text-xs text-gray-600">
                            Commonly used in REST APIs for file transfers
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="shortcuts" className="space-y-4 p-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Keyboard className="h-5 w-5" />
                    Keyboard Shortcuts
                  </h3>
                  <div className="grid gap-3">
                    {[
                      { key: "F1", description: "Toggle this help panel", category: "Help" },
                      { key: "Ctrl+E", description: "Switch to encode mode", category: "Mode" },
                      { key: "Ctrl+D", description: "Switch to decode mode", category: "Mode" },
                      { key: "Ctrl+R", description: "Clear all inputs", category: "Actions" },
                      { key: "Ctrl+C", description: "Copy result", category: "Copy" },
                      { key: "Ctrl+V", description: "Paste and convert", category: "Paste" },
                      { key: "Ctrl+S", description: "Download result", category: "Actions" },
                      { key: "Tab", description: "Navigate between elements", category: "Navigation" },
                      { key: "Enter", description: "Trigger conversion", category: "Actions" },
                      { key: "Escape", description: "Clear current field", category: "Actions" },
                      { key: "Ctrl+Shift+B", description: "Switch to batch mode", category: "Premium", premium: true },
                      { key: "Ctrl+Shift+H", description: "Switch to history tab", category: "Premium", premium: true }
                    ].map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {shortcut.key}
                          </Badge>
                          <span className="text-sm">{shortcut.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {shortcut.category}
                          </Badge>
                          {shortcut.premium && (
                            <Crown className="h-3 w-3 text-amber-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tips" className="space-y-4 p-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Tips & Best Practices
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">When to Use URL-Safe Base64</h4>
                      <div className="grid gap-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">✅ Good Use Cases</div>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>• URL parameters and query strings</li>
                            <li>• File names and paths</li>
                            <li>• JSON Web Tokens (JWT)</li>
                            <li>• Cookie values</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">📝 Standard Base64</div>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• Email attachments (MIME)</li>
                            <li>• Database storage</li>
                            <li>• XML/HTML embedding</li>
                            <li>• Most API integrations</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">File Size Optimization</h4>
                      <div className="grid gap-3">
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="font-medium text-green-900 dark:text-green-100 mb-1">💡 Pro Tips</div>
                          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                            <li>• Base64 increases size by ~33%</li>
                            <li>• Compress files before encoding</li>
                            <li>• Use appropriate image formats (WebP, AVIF)</li>
                            <li>• Consider chunking large files</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Premium Features</h4>
                      <div className="grid gap-3">
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div className="font-medium text-amber-900 dark:text-amber-100 mb-1">🔄 Batch Processing</div>
                          <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                            <li>• Process multiple files or text entries at once</li>
                            <li>• Track progress and handle errors gracefully</li>
                            <li>• Export results as CSV or JSON</li>
                            <li>• Support for up to 100 items per batch</li>
                            <li>• Apply character set and newline options to all items</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                          <div className="font-medium text-purple-900 dark:text-purple-100 mb-1">📖 Conversion History</div>
                          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                            <li>• Automatic saving of all conversions with encoding options</li>
                            <li>• Search and filter by type, mode, or name</li>
                            <li>• Reuse previous conversions instantly</li>
                            <li>• Export and manage up to 100 entries</li>
                            <li>• Preserve character set and newline preferences</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Common Pitfalls</h4>
                      <div className="grid gap-3">
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="font-medium text-red-900 dark:text-red-100 mb-1">⚠️ Avoid These Mistakes</div>
                          <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                            <li>• Don&apos;t use Base64 for large file storage</li>
                            <li>• Avoid multiple encoding (Base64 of Base64)</li>
                            <li>• Check for line breaks in copied text</li>
                            <li>• Validate Base64 format before processing</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Performance Considerations</h4>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                          <li>• Large files may take time to process</li>
                          <li>• Browser memory limits apply</li>
                          <li>• Use streaming for very large files</li>
                          <li>• Consider worker threads for batch processing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="accessibility" className="space-y-4 p-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Accessibility Features
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Screen Reader Support</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="font-medium mb-2">Navigation</div>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• All controls have descriptive labels</li>
                            <li>• Tab order follows logical flow</li>
                            <li>• Status updates announced automatically</li>
                            <li>• Error messages read aloud</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="font-medium mb-2">Content</div>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• Input and output areas clearly identified</li>
                            <li>• File upload status announced</li>
                            <li>• Conversion progress reported</li>
                            <li>• Results summary provided</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Keyboard Navigation</h4>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          <li>• <strong>Tab:</strong> Move to next control</li>
                          <li>• <strong>Shift+Tab:</strong> Move to previous control</li>
                          <li>• <strong>Enter/Space:</strong> Activate buttons</li>
                          <li>• <strong>Arrow Keys:</strong> Navigate dropdowns</li>
                          <li>• <strong>Escape:</strong> Cancel operations</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Visual Accessibility</h4>
                      <div className="grid gap-3">
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="font-medium text-green-900 dark:text-green-100 mb-2">High Contrast</div>
                          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                            <li>• Dark/light theme support</li>
                            <li>• High contrast mode compatible</li>
                            <li>• Clear focus indicators</li>
                            <li>• Sufficient color contrast ratios</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                          <div className="font-medium text-purple-900 dark:text-purple-100 mb-2">Motor Accessibility</div>
                          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                            <li>• Large click targets (44px minimum)</li>
                            <li>• Drag and drop alternatives</li>
                            <li>• Keyboard shortcuts for all actions</li>
                            <li>• No time-based interactions</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Getting Help</h4>
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                          <li>• Press <strong>F1</strong> to open this help panel</li>
                          <li>• Use <strong>Tab</strong> to navigate help sections</li>
                          <li>• All features work without mouse</li>
                          <li>• Contact support for additional assistance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}