'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, Copy, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface HelpPanelProps {
  onClose: () => void
}

export default function HelpPanel({ onClose }: HelpPanelProps) {
  const { toast } = useToast()
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        type: 'success',
        title: 'Copied!',
        description: 'Copied to clipboard'
      })
    } catch (error) {
      toast({
        type: 'error',
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard'
      })
    }
  }

  const xpathExamples = [
    {
      name: 'All elements with class',
      selector: '//*[@class="feature-card"]',
      description: 'Select all elements with class="feature-card"'
    },
    {
      name: 'Elements by tag name',
      selector: '//div',
      description: 'Select all div elements'
    },
    {
      name: 'Elements with multiple attributes',
      selector: '//div[@class="feature-card" and @data-feature="responsive"]',
      description: 'Select divs with both class and data-feature attributes'
    },
    {
      name: 'Child elements',
      selector: '//section/div',
      description: 'Select div elements that are direct children of section'
    },
    {
      name: 'Descendant elements',
      selector: '//section//div',
      description: 'Select div elements anywhere within section'
    },
    {
      name: 'Elements by text content',
      selector: '//h1[contains(text(), "Welcome")]',
      description: 'Select h1 elements containing "Welcome"'
    },
    {
      name: 'Elements by position',
      selector: '//div[1]',
      description: 'Select the first div element'
    },
    {
      name: 'Elements with partial class match',
      selector: '//*[contains(@class, "feature")]',
      description: 'Select elements with class containing "feature"'
    }
  ]

  const cssExamples = [
    {
      name: 'Class selector',
      selector: '.feature-card',
      description: 'Select elements with class="feature-card"'
    },
    {
      name: 'ID selector',
      selector: '#main-content',
      description: 'Select element with id="main-content"'
    },
    {
      name: 'Tag selector',
      selector: 'div',
      description: 'Select all div elements'
    },
    {
      name: 'Descendant selector',
      selector: 'section div',
      description: 'Select div elements anywhere within section'
    },
    {
      name: 'Child selector',
      selector: 'section > div',
      description: 'Select div elements that are direct children of section'
    },
    {
      name: 'Attribute selector',
      selector: '[data-feature="responsive"]',
      description: 'Select elements with data-feature="responsive"'
    },
    {
      name: 'Multiple classes',
      selector: '.feature-card.important',
      description: 'Select elements with both classes'
    },
    {
      name: 'Pseudo-class',
      selector: 'div:first-child',
      description: 'Select first div child element'
    }
  ]

  const keyboardShortcuts = [
    { key: 'F1', description: 'Open help panel' },
    { key: 'Ctrl + T', description: 'Test current selector' },
    { key: 'Ctrl + C', description: 'Copy results to clipboard' },
    { key: 'Ctrl + Enter', description: 'Test selector (in input fields)' },
    { key: 'Escape', description: 'Close help panel' }
  ]

  const tips = [
    'Use XPath for complex hierarchical queries and attribute-based selection',
    'Use CSS selectors for simpler, more readable queries',
    'Test your selectors with the sample HTML first',
    'Check the execution time to optimize your selectors',
    'Use the copy functionality to save matched elements',
    'Premium users can upload HTML files and test against live URLs',
    'Export results for further analysis in other tools',
    'Save frequently used selectors for quick access'
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">XPath/CSS Selector Tester Help</CardTitle>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="examples" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="examples" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* XPath Examples */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-blue-600">XPath</span>
                    <Badge variant="outline">Advanced</Badge>
                  </h3>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {xpathExamples.map((example, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{example.name}</h4>
                            <Button
                              onClick={() => copyToClipboard(example.selector)}
                              variant="outline"
                              size="sm"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <code className="block text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded mb-2 font-mono">
                            {example.selector}
                          </code>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {example.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* CSS Examples */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-green-600">CSS</span>
                    <Badge variant="outline">Simple</Badge>
                  </h3>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {cssExamples.map((example, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{example.name}</h4>
                            <Button
                              onClick={() => copyToClipboard(example.selector)}
                              variant="outline"
                              size="sm"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <code className="block text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded mb-2 font-mono">
                            {example.selector}
                          </code>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {example.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shortcuts" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keyboardShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Pro Tips</h3>
                <div className="space-y-3">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                      <span className="text-blue-600 dark:text-blue-400 text-sm">💡</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">About XPath/CSS Selector Tester</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">What is XPath?</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      XPath (XML Path Language) is a query language for selecting nodes from an XML document. 
                      It&apos;s powerful for complex queries and is widely used in web scraping and XML processing.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">What are CSS Selectors?</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      CSS selectors are patterns used to select and style HTML elements. They&apos;re simpler than XPath 
                      and are the standard way to select elements in web development.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">When to Use Each</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• <strong>XPath:</strong> Complex queries, attribute-based selection, text content matching</li>
                      <li>• <strong>CSS:</strong> Simple element selection, class/ID-based queries, web development</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Real-time selector testing and validation</li>
                      <li>• Match highlighting and result display</li>
                      <li>• Copy functionality for matched elements</li>
                      <li>• Sample HTML and selector examples</li>
                      <li>• Premium: File upload and URL testing</li>
                      <li>• Premium: Advanced XPath functions and CSS pseudo-selectors</li>
                      <li>• Premium: Bulk testing and result export</li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <ExternalLink className="w-4 h-4" />
                    <span>Learn more about XPath and CSS selectors in web development</span>
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