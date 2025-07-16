"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  X, 
  Search, 
  Keyboard, 
  HelpCircle, 
  BookOpen,
  Crown,
  Globe,
  Zap,
  Code
} from "lucide-react"
import { COMMON_PATTERNS } from "../lib/regex-engines"

interface HelpPanelProps {
  isOpen: boolean
  onClose: () => void
  isPremiumUser: boolean
}

interface PatternData {
  pattern: string
  description: string
  testText: string
  flags: string[]
}

export function HelpPanel({ isOpen, onClose, isPremiumUser }: HelpPanelProps) {
  const [activeTab, setActiveTab] = useState<'examples' | 'shortcuts' | 'patterns' | 'languages' | 'tips'>('examples')

  // Function to load a pattern into the regex editor
  const loadPattern = (patternData: PatternData) => {
    // Dispatch event to regex editor to load the pattern
    window.dispatchEvent(new CustomEvent('regex-editor-load-pattern', { 
      detail: patternData 
    }))
    
    // Close help panel after loading
    onClose()
  }

  if (!isOpen) return null

  const keyboardShortcuts = [
    { key: "Ctrl+Enter", action: "Test Pattern", description: "Execute regex pattern against test text" },
    { key: "Ctrl+L", action: "Load Sample", description: "Load sample regex pattern" },
    { key: "Ctrl+C", action: "Copy Matches", description: "Copy all matches to clipboard" },
    { key: "Ctrl+R", action: "Clear All", description: "Clear pattern and test text" },
    { key: "F1", action: "Toggle Help", description: "Show/hide this help panel" },
    { key: "Escape", action: "Close", description: "Close help panel or modal" }
  ]

  const regexBasics = [
    { pattern: ".", description: "Matches any single character except newline" },
    { pattern: "^", description: "Matches start of string or line" },
    { pattern: "$", description: "Matches end of string or line" },
    { pattern: "*", description: "Matches 0 or more of preceding element" },
    { pattern: "+", description: "Matches 1 or more of preceding element" },
    { pattern: "?", description: "Matches 0 or 1 of preceding element" },
    { pattern: "\\d", description: "Matches any digit (0-9)" },
    { pattern: "\\w", description: "Matches any word character (a-z, A-Z, 0-9, _)" },
    { pattern: "\\s", description: "Matches any whitespace character" },
    { pattern: "[abc]", description: "Matches any character in the set" },
    { pattern: "[^abc]", description: "Matches any character NOT in the set" },
    { pattern: "()", description: "Creates a capture group" },
    { pattern: "(?:)", description: "Creates a non-capture group" },
    { pattern: "{n}", description: "Matches exactly n occurrences" },
    { pattern: "{n,m}", description: "Matches between n and m occurrences" }
  ]

  // Convert COMMON_PATTERNS to help panel format
  const commonPatterns = Object.entries(COMMON_PATTERNS).map(([key, data]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'), // Convert camelCase to Title Case
    pattern: data.pattern,
    use: data.description,
    patternData: data
  }))

  const languageFeatures = [
    { 
      language: "JavaScript", 
      features: ["Global flag (g)", "Ignore case (i)", "Multiline (m)", "Dotall (s)", "Unicode (u)", "Sticky (y)"],
      notes: "Full regex support with all modern features"
    },
    { 
      language: "Python", 
      features: ["Verbose mode (x)", "Different Unicode handling", "Named groups", "Conditional expressions"],
      notes: "More powerful named groups and verbose syntax",
      premium: true
    },
    { 
      language: "Java", 
      features: ["Different escaping rules", "Unicode categories", "Possessive quantifiers"],
      notes: "Stricter escaping requirements for special characters",
      premium: true
    },
    { 
      language: "Go", 
      features: ["RE2 engine", "No backreferences", "No lookahead/lookbehind"],
      notes: "Faster but more limited regex features",
      premium: true
    }
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              <CardTitle>Regex Tester Help</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              aria-label="Close help panel"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4">
            <Button
              variant={activeTab === 'examples' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('examples')}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Examples
            </Button>
            <Button
              variant={activeTab === 'shortcuts' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('shortcuts')}
              className="flex items-center gap-2"
            >
              <Keyboard className="w-4 h-4" />
              Shortcuts
            </Button>
            <Button
              variant={activeTab === 'patterns' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('patterns')}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Patterns
            </Button>
            <Button
              variant={activeTab === 'languages' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('languages')}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Languages
            </Button>
            <Button
              variant={activeTab === 'tips' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('tips')}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Tips
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Examples Tab */}
          {activeTab === 'examples' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Common Regex Patterns</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Learn from these practical regex examples. Click any pattern to load it in the editor.
                </p>
              </div>
              
              <div className="grid gap-4">
                {commonPatterns.map((item, index) => (
                  <Card key={index} className="border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <CardDescription>{item.use}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{item.pattern}</code>
                      </pre>
                      <Button 
                        size="sm" 
                        className="mt-3"
                        onClick={() => loadPattern(item.patternData)}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        Load Pattern
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Speed up your workflow with these keyboard shortcuts.
                </p>
              </div>
              
              <div className="grid gap-3">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{shortcut.action}</div>
                      <div className="text-sm text-muted-foreground">{shortcut.description}</div>
                    </div>
                    <div className="text-sm font-mono bg-muted px-3 py-1 rounded">
                      {shortcut.key}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Patterns Tab */}
          {activeTab === 'patterns' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Regex Syntax Reference</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Essential regex syntax and special characters.
                </p>
              </div>
              
              <div className="grid gap-3">
                {regexBasics.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <code className="font-mono font-bold text-sm bg-muted px-3 py-2 rounded min-w-[80px] text-center">
                      {item.pattern}
                    </code>
                    <span className="text-sm">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Languages Tab */}
          {activeTab === 'languages' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Language Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Different programming languages have unique regex implementations.
                </p>
              </div>
              
              <div className="grid gap-4">
                {languageFeatures.map((lang, index) => (
                  <Card key={index} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {lang.language}
                          {lang.premium && !isPremiumUser && (
                            <Crown className="h-4 w-4 text-amber-500" />
                          )}
                        </CardTitle>
                        {lang.premium && !isPremiumUser && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                            Premium
                          </span>
                        )}
                      </div>
                      <CardDescription>{lang.notes}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <h5 className="text-sm font-medium text-muted-foreground mb-2">Features:</h5>
                        <div className="flex flex-wrap gap-1">
                          {lang.features.map((feature, featureIndex) => (
                            <span key={featureIndex} className="text-xs bg-muted px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Tips Tab */}
          {activeTab === 'tips' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Tips & Best Practices</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Expert tips for writing effective regex patterns.
                </p>
              </div>
              
              <div className="space-y-4">
                <Card className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Performance Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Use specific character classes instead of . when possible</li>
                      <li>• Avoid excessive backtracking with nested quantifiers</li>
                      <li>• Use non-capturing groups (?:) when you don't need the match</li>
                      <li>• Be careful with .* and .+ - they can be slow on large text</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Testing Strategy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Start simple and add complexity gradually</li>
                      <li>• Test with edge cases and boundary conditions</li>
                      <li>• Use different languages to verify compatibility</li>
                      <li>• Check both positive and negative test cases</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Common Mistakes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Forgetting to escape special characters</li>
                      <li>• Not considering case sensitivity</li>
                      <li>• Assuming all regex engines are the same</li>
                      <li>• Creating overly complex patterns when simple ones work</li>
                    </ul>
                  </CardContent>
                </Card>
                
                {!isPremiumUser && (
                  <Card className="border border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-500" />
                        Premium Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li>• Multi-language regex engines (Python, Java, Go, PHP, C#)</li>
                        <li>• Pattern explanations and visualizations</li>
                        <li>• Comprehensive pattern library (100+ examples)</li>
                        <li>• Save and organize your custom patterns</li>
                        <li>• Advanced replace functionality</li>
                        <li>• Performance analysis and ReDoS detection</li>
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 