'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Image as ImageIcon, 
  Download, 
  Upload, 
  Settings, 
  History, 
  Star,
  Crown,
  Keyboard,
  Lightbulb,
  Eye,
  Zap,
  Database,
  FileImage,
  FolderOpen,
  Save,
  RefreshCw,
  Info
} from 'lucide-react';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isBackerUser: boolean;
}

export default function HelpPanel({ isOpen, onClose, isBackerUser }: HelpPanelProps) {
  if (!isOpen) return null;

  const helpContent = {
    examples: [
      {
        title: "Basic Image Compression",
        description: "Compress a single image with quality control",
        steps: [
          "Click 'Upload Image' or drag & drop a file",
          "Adjust the quality slider (1-100%)",
          "Select output format (JPEG, PNG, WebP, AVIF)",
          "Click 'Download' to save the compressed image"
        ],
        premium: false
      },
      {
        title: "Batch Processing",
        description: "Process multiple images simultaneously with consistent settings",
        steps: [
          "Click 'Batch Upload' (Premium feature)",
          "Select multiple images from your device",
          "Configure compression settings once",
          "Click 'Process Batch' to compress all images",
          "Download all images as a ZIP file"
        ],
        premium: true
      },
      {
        title: "Format Conversion",
        description: "Convert images between different formats while compressing",
        steps: [
          "Upload an image in any supported format",
          "Click 'Convert' (Premium feature)",
          "Select target format (JPEG, PNG, WebP, AVIF)",
          "Adjust quality and advanced settings",
          "Download the converted image"
        ],
        premium: true
      },
      {
        title: "Advanced Settings",
        description: "Fine-tune compression with professional options",
        steps: [
          "Click 'Settings' (Premium feature)",
          "Set maximum width/height dimensions",
          "Enable progressive loading for JPEG",
          "Choose lossless compression for PNG/WebP",
          "Strip metadata to reduce file size"
        ],
        premium: true
      },
      {
        title: "Save Favorite Settings",
        description: "Save your preferred compression settings for quick access",
        steps: [
          "Configure your ideal compression settings",
          "Click 'Save Settings' (Premium feature)",
          "Give your settings a memorable name",
          "Set as default for future use",
          "Load saved settings anytime"
        ],
        premium: true
      },
      {
        title: "Compression History",
        description: "Track your compression history and reuse settings",
        steps: [
          "Compress images normally",
          "View history in the 'History' tab (Premium)",
          "See original vs compressed file sizes",
          "Reuse previous settings",
          "Delete history entries as needed"
        ],
        premium: true
      }
    ],
    shortcuts: [
      { key: "F1", action: "Open help panel", description: "Quick access to documentation" },
      { key: "Ctrl+U", action: "Upload single image", description: "Fast file selection" },
      { key: "Ctrl+B", action: "Batch upload (Premium)", description: "Select multiple files" },
      { key: "Ctrl+D", action: "Download all images (Premium)", description: "Bulk download as ZIP" },
      { key: "Ctrl+S", action: "Save to history (Premium)", description: "Save current settings" },
      { key: "Ctrl+H", action: "Toggle help panel", description: "Show/hide help" },
      { key: "Escape", action: "Close modals", description: "Close any open dialog" },
      { key: "Tab", action: "Navigate interface", description: "Keyboard navigation" },
      { key: "Space", action: "Toggle comparison view", description: "Show before/after" }
    ],
    tips: [
      {
        tip: "Choose the right format for your use case",
        details: "JPEG for photos, PNG for transparency, WebP for web, AVIF for best compression"
      },
      {
        tip: "Quality vs file size trade-off",
        details: "Higher quality = larger files. 80-90% is usually optimal for web use"
      },
      {
        tip: "Batch processing saves time",
        details: "Process multiple images with the same settings in one operation"
      },
      {
        tip: "WebP offers excellent compression",
        details: "Modern format with 25-35% smaller files than JPEG at same quality"
      },
      {
        tip: "PNG is lossless",
        details: "Perfect for graphics, logos, and images requiring transparency"
      },
      {
        tip: "AVIF is the future",
        details: "Best compression but limited browser support. Use for modern web apps"
      },
      {
        tip: "Strip metadata to reduce size",
        details: "Remove EXIF data, GPS coordinates, and other metadata for smaller files"
      },
      {
        tip: "Progressive JPEG for web",
        details: "Images load gradually, improving perceived performance"
      },
      {
        tip: "Save your favorite settings",
        details: "Create presets for different use cases (web, print, social media)"
      },
      {
        tip: "Check compression ratio",
        details: "Aim for 60-80% compression ratio for optimal balance"
      }
    ],
    features: [
      {
        title: "Free Features",
        features: [
          "Single image compression",
          "Quality adjustment (1-100%)",
          "Basic format support (JPEG, PNG)",
          "File size comparison",
          "Real-time preview",
          "Drag & drop upload",
          "Keyboard shortcuts",
          "Accessibility support"
        ]
      },
      {
        title: "Premium Features",
        features: [
          "Batch processing (multiple images)",
          "Advanced formats (WebP, AVIF)",
          "Format conversion",
          "Advanced settings (dimensions, metadata)",
          "Compression history",
          "Favorite settings",
          "Bulk download (ZIP)",
          "User preferences",
          "Analytics tracking",
          "Progressive/lossless options"
        ]
      }
    ],
    accessibility: [
      {
        feature: "Keyboard Navigation",
        description: "All features accessible via keyboard. Use Tab to navigate, Enter/Space to activate"
      },
      {
        feature: "Screen Reader Support",
        description: "ARIA labels and descriptions for all interactive elements"
      },
      {
        feature: "High Contrast",
        description: "Supports dark/light themes with proper contrast ratios"
      },
      {
        feature: "Focus Management",
        description: "Clear focus indicators and logical tab order"
      },
      {
        feature: "Error Announcements",
        description: "Screen readers announce validation errors and processing status"
      },
      {
        feature: "Alternative Text",
        description: "All images have descriptive alt text for screen readers"
      }
    ],
    database: [
      {
        feature: "Compression History",
        description: "Track all your compression activities with original and compressed file details"
      },
      {
        feature: "Favorite Settings",
        description: "Save and name your preferred compression configurations for quick access"
      },
      {
        feature: "User Preferences",
        description: "Store default settings, preferred formats, and personal preferences"
      },
      {
        feature: "Analytics Tracking",
        description: "Monitor usage patterns and compression performance (privacy-compliant)"
      },
      {
        feature: "Data Security",
        description: "All data protected with Row Level Security and user-specific access"
      }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Image Compressor Help
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete guide to using the Image Compressor tool
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close help panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="examples" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="examples" className="flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                Examples
              </TabsTrigger>
              <TabsTrigger value="shortcuts" className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Shortcuts
              </TabsTrigger>
              <TabsTrigger value="tips" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Tips
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="accessibility" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Accessibility
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database
              </TabsTrigger>
            </TabsList>

            {/* Examples Tab */}
            <TabsContent value="examples" className="space-y-4">
              <div className="grid gap-4">
                {helpContent.examples.map((example, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {example.premium && <Crown className="h-4 w-4 text-yellow-500" />}
                        {example.title}
                        {example.premium && (
                          <Badge variant="secondary" className="ml-auto">
                            Premium
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {example.description}
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {example.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-gray-700 dark:text-gray-300">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Shortcuts Tab */}
            <TabsContent value="shortcuts" className="space-y-4">
              <div className="grid gap-4">
                {helpContent.shortcuts.map((shortcut, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md">
                            {shortcut.key}
                          </kbd>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {shortcut.action}
                          </span>
                        </div>
                        {shortcut.key.includes('Premium') && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {shortcut.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tips Tab */}
            <TabsContent value="tips" className="space-y-4">
              <div className="grid gap-4">
                {helpContent.tips.map((tip, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {tip.tip}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {tip.details}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-4">
              <div className="grid gap-4">
                {helpContent.features.map((category, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {category.title === "Premium Features" && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility" className="space-y-4">
              <div className="grid gap-4">
                {helpContent.accessibility.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Eye className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {item.feature}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Database Tab */}
            <TabsContent value="database" className="space-y-4">
              <div className="grid gap-4">
                {helpContent.database.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Database className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {item.feature}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Info className="h-4 w-4" />
            <span>
                              {isBackerUser ? "Backer user - All features available" : "Free user - Become a backer for advanced features"}
            </span>
          </div>
          <Button onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
} 