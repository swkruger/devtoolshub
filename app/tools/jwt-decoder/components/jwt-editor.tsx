'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';

const AceEditor = dynamic(
  async () => {
    const ace = await import('react-ace');
    if (typeof window !== 'undefined') {
      await import('ace-builds/src-noconflict/mode-text');
      await import('ace-builds/src-noconflict/theme-github');
      await import('ace-builds/src-noconflict/theme-monokai');
      await import('ace-builds/src-noconflict/theme-tomorrow_night');
      await import('ace-builds/src-noconflict/ext-language_tools');
    }
    return ace;
  },
  {
    ssr: false,
    loading: () => <div className="h-[120px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">Loading editor...</div>
  }
);

interface JwtEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isDarkMode?: boolean;
}

const JwtEditor: React.FC<JwtEditorProps> = ({ value, onChange, placeholder, isDarkMode }) => {
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const sizeKB = (new Blob([value]).size / 1024).toFixed(1);

  return (
    <div className="mt-4">
      <label className="text-sm font-medium mb-2 block text-foreground">JWT Input</label>
      <div className="border border-border rounded-lg overflow-hidden">
        <AceEditor
          mode="text"
          theme={isDarkMode ? 'tomorrow_night' : 'github'}
          value={value}
          onChange={onChange}
          name="jwt-editor"
          editorProps={{ $blockScrolling: true }}
          width="100%"
          height="120px"
          fontSize={14}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
            wrap: true,
            printMargin: 80,
          }}
          placeholder={placeholder}
          onCursorChange={(selection) => {
            setCursor({
              line: selection.cursor.row + 1,
              column: selection.cursor.column + 1,
            });
          }}
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
        <span>Size: {sizeKB} KB</span>
        <span>Line {cursor.line}, Column {cursor.column}</span>
      </div>
    </div>
  );
};

export default JwtEditor; 