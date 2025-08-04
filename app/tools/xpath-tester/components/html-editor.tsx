'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Code } from 'lucide-react'

// Dynamic import for AceEditor to avoid SSR issues
const AceEditor = dynamic(
  async () => {
    const ace = await import("react-ace")
    
    // Import ace modules after react-ace is loaded
    if (typeof window !== 'undefined') {
      await import("ace-builds/src-noconflict/mode-html")
      await import("ace-builds/src-noconflict/theme-github") 
      await import("ace-builds/src-noconflict/theme-monokai")
      await import("ace-builds/src-noconflict/ext-language_tools")
    }
    
    return ace
  },
  { 
    ssr: false,
    loading: () => <div className="h-[300px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">Loading editor...</div>
  }
)

interface HtmlEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onLoad?: (editor: any) => void
  onCursorChange?: (selection: any) => void
}

export default function HtmlEditor({ value, onChange, placeholder = "Enter HTML content to test against...", onLoad, onCursorChange }: HtmlEditorProps) {
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
          <Code className="w-5 h-5" />
          HTML Content
        </CardTitle>
      </CardHeader>
      <CardContent>
                  <AceEditor
            mode="html"
            theme={isDarkMode ? "monokai" : "github"}
            value={value}
            onChange={onChange}
            onLoad={(editor) => {
              handleEditorLoad(editor)
              if (onLoad) onLoad(editor)
            }}
            onCursorChange={onCursorChange}
            name="html-editor"
            editorProps={{ $blockScrolling: true }}
            width="100%"
            height="300px"
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
            placeholder={placeholder}
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
          />
      </CardContent>
    </Card>
  )
} 