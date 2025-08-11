'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  X, 
  BookOpen, 
  Keyboard, 
  Zap, 
  Info, 
  Crown,
  Hash,
  Clock,
  Database,
  FileText
} from 'lucide-react';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAMPLES = [
  {
    title: 'UUID v4 (Random)',
    description: 'Most common UUID type, cryptographically random',
    example: '550e8400-e29b-41d4-a716-446655440000',
    code: 'Generate UUID v4 with standard format'
  },
  {
    title: 'UUID v1 (Timestamp)',
    description: 'Time-based UUID with MAC address',
    example: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    code: 'Generate UUID v1 with timestamp'
  },
  {
    title: 'UUID v3 (MD5)',
    description: 'Namespace-based UUID using MD5 hash',
    example: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    code: 'Generate UUID v3 with namespace and name'
  },
  {
    title: 'UUID v5 (SHA-1)',
    description: 'Namespace-based UUID using SHA-1 hash',
    example: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    code: 'Generate UUID v5 with namespace and name'
  },
  {
    title: 'Compact Format',
    description: 'UUID without hyphens for shorter representation',
    example: '550e8400e29b41d4a716446655440000',
    code: 'Generate UUID with compact format'
  }
];

interface Shortcut {
  key: string;
  description: string;
  premium?: boolean;
}

const SHORTCUTS = [
  {
    category: 'Core Actions',
    shortcuts: [
      { key: 'F1', description: 'Toggle help panel' },
      { key: 'Ctrl+G', description: 'Generate new UUID' },
      { key: 'Ctrl+C', description: 'Copy current UUID' },
      { key: 'Escape', description: 'Close all modals' }
    ] as Shortcut[]
  },
  {
    category: 'Premium Actions',
    shortcuts: [
      { key: 'Ctrl+B', description: 'Open bulk generator', premium: true },
      { key: 'Ctrl+N', description: 'Open namespace manager', premium: true },
      { key: 'Ctrl+H', description: 'Open UUID history', premium: true },
      { key: 'Ctrl+D', description: 'Download UUIDs', premium: true }
    ] as Shortcut[]
  }
];

const TIPS = [
  'Use UUID v4 for most applications requiring unique identifiers',
  'UUID v1 is useful when you need time-based ordering',
  'UUID v3/v5 are deterministic - same namespace + name always produces same UUID',
  'Compact format is useful for URLs and shorter storage',
  'Base64 format is useful for binary storage and transmission',
  'Binary format is useful for bit-level operations',
  'Always validate UUIDs before using them in production',
  'Consider collision probability for your use case',
  'Use appropriate UUID version for your security requirements',
  'Namespace UUIDs should be registered with IANA for public use'
];

const ACCESSIBILITY = [
  'All buttons have descriptive aria-labels',
  'Keyboard navigation supported throughout',
  'Screen reader friendly UUID display',
  'High contrast mode supported',
  'Focus indicators visible on all interactive elements',
  'Error messages announced to screen readers',
  'Modal dialogs properly trap focus',
  'Form labels properly associated with inputs',
  'Status changes announced to assistive technology',
  'Alternative text provided for all icons'
];

export default function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
  const [activeTab, setActiveTab] = useState<'examples' | 'shortcuts' | 'tips' | 'accessibility'>('examples');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              UUID Generator Help
            </h2>
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
        <div className="flex gap-2 mb-6">
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
            variant={activeTab === 'tips' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('tips')}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Tips
          </Button>
          <Button
            variant={activeTab === 'accessibility' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('accessibility')}
            className="flex items-center gap-2"
          >
            <Info className="w-4 h-4" />
            Accessibility
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'examples' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              UUID Examples and Usage
            </h3>
            {EXAMPLES.map((example, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <Hash className="w-4 h-4 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {example.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {example.description}
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono text-sm mb-2">
                      {example.example}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {example.code}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'shortcuts' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Keyboard Shortcuts
            </h3>
            {SHORTCUTS.map((category, index) => (
              <div key={index}>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {category.category}
                </h4>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, shortcutIndex) => (
                    <div key={shortcutIndex} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded">
                          {shortcut.key}
                        </kbd>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {shortcut.description}
                        </span>
                      </div>
                      {shortcut.premium && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Usage Tips and Best Practices
            </h3>
            <div className="grid gap-3">
              {TIPS.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <Zap className="w-4 h-4 text-blue-500 mt-1" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {tip}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'accessibility' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Accessibility Features
            </h3>
            <div className="grid gap-3">
              {ACCESSIBILITY.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <Info className="w-4 h-4 text-green-500 mt-1" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} aria-label="Close help panel">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 