'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search } from 'lucide-react'

// Dynamic import for AceEditor to avoid SSR issues
const AceEditor = dynamic(
  async () => {
    const ace = await import("react-ace")
    
    // Import ace modules after react-ace is loaded
    if (typeof window !== 'undefined') {
      await import("ace-builds/src-noconflict/mode-xml")
      await import("ace-builds/src-noconflict/mode-css")
      await import("ace-builds/src-noconflict/theme-github") 
      await import("ace-builds/src-noconflict/theme-monokai")
      await import("ace-builds/src-noconflict/ext-language_tools")
    }
    
    return ace
  },
  { 
    ssr: false,
    loading: () => <div className="h-[100px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">Loading editor...</div>
  }
)

interface SelectorEditorProps {
  xpathValue: string
  cssValue: string
  onXpathChange: (value: string) => void
  onCssChange: (value: string) => void
  activeTab: 'xpath' | 'css'
  onTabChange: (tab: 'xpath' | 'css') => void
}

export default function SelectorEditor({ 
  xpathValue, 
  cssValue, 
  onXpathChange, 
  onCssChange, 
  activeTab, 
  onTabChange 
}: SelectorEditorProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check for dark mode class on html element
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    // Initial check
    checkDarkMode()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  const handleEditorLoad = (editor: any) => {
    editor.focus()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Selector
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'xpath' | 'css')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="xpath">XPath</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
          </TabsList>
          <TabsContent value="xpath" className="mt-4">
            <AceEditor
              mode="xml"
              theme={isDarkMode ? "monokai" : "github"}
              value={xpathValue}
              onChange={onXpathChange}
              onLoad={handleEditorLoad}
              name="xpath-editor"
              editorProps={{ $blockScrolling: true }}
              width="100%"
              height="100px"
              fontSize={14}
              showPrintMargin={true}
              showGutter={true}
              highlightActiveLine={true}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: false,
                showLineNumbers: true,
                tabSize: 2,
                wrap: true,
                printMargin: 80,
              }}
              placeholder="Enter XPath selector (e.g., //div[@class='feature-card'])"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            />
          </TabsContent>
          <TabsContent value="css" className="mt-4">
            <AceEditor
              mode="css"
              theme={isDarkMode ? "monokai" : "github"}
              value={cssValue}
              onChange={onCssChange}
              onLoad={handleEditorLoad}
              name="css-editor"
              editorProps={{ $blockScrolling: true }}
              width="100%"
              height="100px"
              fontSize={14}
              showPrintMargin={true}
              showGutter={true}
              highlightActiveLine={true}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: false,
                showLineNumbers: true,
                tabSize: 2,
                wrap: true,
                printMargin: 80,
              }}
              placeholder="Enter CSS selector (e.g., .feature-card)"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 