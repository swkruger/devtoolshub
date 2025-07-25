'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, X, BookOpen, Keyboard, Zap, Info, Crown } from 'lucide-react';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAMPLES = [
  {
    title: 'Valid JWT',
    description: 'Standard JWT with header, payload, and signature',
    value:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  },
  {
    title: 'Expired JWT',
    description: 'JWT with an expired exp claim',
    value:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDAsImlhdCI6MTYwMDAwMDAwMH0.abc123signature',
  },
  {
    title: 'Malformed JWT',
    description: 'JWT missing signature or with invalid structure',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload',
  },
];

const SHORTCUTS = [
  {
    category: "Navigation",
    shortcuts: [
      { key: "F1", description: "Toggle help panel", premium: false },
    ]
  },
  {
    category: "Basic Actions",
    shortcuts: [
      { key: "Ctrl+L", description: "Load sample JWT", premium: false },
      { key: "Ctrl+R", description: "Clear/reset editor", premium: false },
      { key: "Ctrl+C", description: "Copy decoded payload", premium: false },
    ]
  },
  {
    category: "Premium Features",
    shortcuts: [
      { key: "Ctrl+S", description: "Save JWT snippet", premium: true },
      { key: "Ctrl+O", description: "Open snippets manager", premium: true },
      { key: "Ctrl+U", description: "Upload JWT file", premium: true },
      { key: "Ctrl+D", description: "Download JWT", premium: true },
      { key: "Ctrl+V", description: "Verify signature", premium: true },
      { key: "Ctrl+I", description: "Open token inspector", premium: true },
    ]
  }
];

const TIPS = [
  'JWTs are base64url-encoded and have three parts: header, payload, signature.',
  'Use the sample button to quickly test decoding and validation.',
  'Signature verification and JWT creation are premium features.',
  'Expired tokens will show a warning in the decoded output.',
  'Copy and download features are available for easy sharing.',
];

const ACCESSIBILITY = [
  'All buttons and inputs are keyboard accessible.',
  'Screen reader labels are provided for all actions.',
  'Status messages and errors are announced for assistive tech.',
  'Use Tab/Shift+Tab to navigate between controls.',
  'High contrast and dark mode supported.',
];

const TAB_LIST = [
  { key: 'examples', label: 'Examples', icon: BookOpen },
  { key: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  { key: 'tips', label: 'Tips', icon: Zap },
  { key: 'accessibility', label: 'Accessibility', icon: Info },
];

const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'examples' | 'shortcuts' | 'tips' | 'accessibility'>('examples');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <CardTitle>JWT Decoder/Encoder Help</CardTitle>
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
            {TAB_LIST.map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.key as any)}
                className="flex items-center gap-2"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
          {activeTab === 'examples' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">JWT Examples</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Learn from these practical JWT examples. Copy and paste into the editor to test decoding and validation.
                </p>
              </div>
              <div className="grid gap-4">
                {EXAMPLES.map((ex, idx) => (
                  <Card key={idx} className="border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{ex.title}</CardTitle>
                      <CardDescription>{ex.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{ex.value}</code>
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'shortcuts' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-4">
                {SHORTCUTS.map((category, idx) => (
                  <div key={idx}>
                    <h4 className="font-medium text-sm mb-2">{category.category}</h4>
                    <ul className="space-y-2">
                      {category.shortcuts.map((shortcut, sIdx) => (
                        <li key={sIdx} className="flex items-center gap-4 text-sm">
                          <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{shortcut.key}</span>
                          <span className="flex items-center gap-2">
                            {shortcut.description}
                            {shortcut.premium && (
                              <Crown className="w-3 h-3 text-amber-500" />
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'tips' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Tips & Best Practices</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {TIPS.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Accessibility Features</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {ACCESSIBILITY.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPanel; 