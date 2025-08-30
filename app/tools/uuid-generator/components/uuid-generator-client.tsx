'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  RefreshCw, 
  Download, 
  Settings, 
  HelpCircle, 
  Crown,
  AlertCircle,
  Check,
  X,
  Loader2,
  Hash,
  Clock,
  Database,
  FileText,
  Star,
  History,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import HelpPanel from './help-panel';
import { Spinner } from '@/components/ui/spinner';
import BulkGenerator from './bulk-generator';
import NamespaceManager from './namespace-manager';
import UuidHistory from './uuid-history';

interface UuidGeneratorClientProps {
  isBackerUser: boolean;
  userId?: string;
}

interface UuidEntry {
  id: string;
  uuid: string;
  version: string;
  format: string;
  timestamp: Date;
  namespace?: string;
  name?: string;
}

type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5';
type UuidFormat = 'standard' | 'compact' | 'base64' | 'binary';

export default function UuidGeneratorClient({ isBackerUser, userId }: UuidGeneratorClientProps) {
  const showSuccess = (title: string, description?: string) => toast.success(title, { description })
  const showError = (title: string, description?: string) => toast.error(title, { description })
  const [currentUuid, setCurrentUuid] = useState<string>('');
  const [uuidVersion, setUuidVersion] = useState<UuidVersion>('v4');
  const [uuidFormat, setUuidFormat] = useState<UuidFormat>('standard');
  const [namespace, setNamespace] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isBulkGeneratorOpen, setIsBulkGeneratorOpen] = useState(false);
  const [isNamespaceManagerOpen, setIsNamespaceManagerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [generatedUuids, setGeneratedUuids] = useState<UuidEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Generate UUID based on version and format
  const generateUuid = useCallback(async (version: UuidVersion, format: UuidFormat, customNamespace?: string, customName?: string) => {
    setIsGenerating(true);
    setValidationErrors([]);

    try {
      let uuid: string;
      
      switch (version) {
        case 'v1':
          uuid = await generateUuidV1();
          break;
        case 'v3':
          uuid = await generateUuidV3(customNamespace || '6ba7b810-9dad-11d1-80b4-00c04fd430c8', customName || 'example');
          break;
        case 'v4':
          uuid = await generateUuidV4();
          break;
        case 'v5':
          uuid = await generateUuidV5(customNamespace || '6ba7b810-9dad-11d1-80b4-00c04fd430c8', customName || 'example');
          break;
        default:
          uuid = await generateUuidV4();
      }

      // Format UUID based on selected format
      const formattedUuid = formatUuid(uuid, format);
      
      const entry: UuidEntry = {
        id: Date.now().toString(),
        uuid: formattedUuid,
        version,
        format,
        timestamp: new Date(),
        namespace: customNamespace,
        name: customName
      };

      setCurrentUuid(formattedUuid);
      setGeneratedUuids(prev => [entry, ...prev.slice(0, 9)]); // Keep last 10

      showSuccess('UUID Generated', `${version.toUpperCase()} UUID generated successfully`);

    } catch (error) {
      console.error('Error generating UUID:', error);
      setValidationErrors(['Failed to generate UUID. Please try again.']);
      showError('Generation Failed', 'Failed to generate UUID. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  // UUID Generation Functions
  const generateUuidV1 = async (): Promise<string> => {
    // Simulate V1 UUID generation (timestamp-based)
    const timestamp = Date.now();
    const clockSeq = Math.floor(Math.random() * 0x3fff) + 0x8000;
    const nodeId = Math.floor(Math.random() * 0xffffffffffff);
    
    const timeLow = (timestamp & 0xffffffff).toString(16).padStart(8, '0');
    const timeMid = ((timestamp >> 32) & 0xffff).toString(16).padStart(4, '0');
    const timeHigh = (((timestamp >> 48) & 0x0fff) | 0x1000).toString(16).padStart(4, '0');
    const clockSeqHex = clockSeq.toString(16).padStart(4, '0');
    const nodeIdHex = nodeId.toString(16).padStart(12, '0');
    
    return `${timeLow}-${timeMid}-${timeHigh}-${clockSeqHex}-${nodeIdHex}`;
  };

  const generateUuidV3 = async (namespace: string, name: string): Promise<string> => {
    // Simulate V3 UUID generation (MD5-based)
    const combined = namespace + name;
    const hash = await crypto.subtle.digest('MD5', new TextEncoder().encode(combined));
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `${hashHex.slice(0, 8)}-${hashHex.slice(8, 12)}-${(parseInt(hashHex.slice(12, 16), 16) & 0x0fff | 0x3000).toString(16).padStart(4, '0')}-${(parseInt(hashHex.slice(16, 18), 16) & 0x3f | 0x80).toString(16).padStart(2, '0')}${hashHex.slice(18, 20)}-${hashHex.slice(20, 32)}`;
  };

  const generateUuidV4 = async (): Promise<string> => {
    // Generate V4 UUID (random)
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    
    // Set version (4) and variant bits
    array[6] = (array[6] & 0x0f) | 0x40;
    array[8] = (array[8] & 0x3f) | 0x80;
    
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  };

  const generateUuidV5 = async (namespace: string, name: string): Promise<string> => {
    // Simulate V5 UUID generation (SHA-1-based)
    const combined = namespace + name;
    const hash = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(combined));
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `${hashHex.slice(0, 8)}-${hashHex.slice(8, 12)}-${(parseInt(hashHex.slice(12, 16), 16) & 0x0fff | 0x5000).toString(16).padStart(4, '0')}-${(parseInt(hashHex.slice(16, 18), 16) & 0x3f | 0x80).toString(16).padStart(2, '0')}${hashHex.slice(18, 20)}-${hashHex.slice(20, 32)}`;
  };

  // Format UUID based on selected format
  const formatUuid = (uuid: string, format: UuidFormat): string => {
    switch (format) {
      case 'compact':
        return uuid.replace(/-/g, '');
      case 'base64':
        return btoa(uuid.replace(/-/g, ''));
      case 'binary':
        return uuid.replace(/-/g, '').split('').map(char => parseInt(char, 16).toString(2).padStart(4, '0')).join('');
      default:
        return uuid;
    }
  };

  // Copy UUID to clipboard
  const copyToClipboard = async (uuid: string) => {
    try {
      await navigator.clipboard.writeText(uuid);
      showSuccess('Copied!', 'UUID copied successfully');
    } catch (error) {
      showError('Copy failed', 'Failed to copy UUID to clipboard');
    }
  };

  // Download UUIDs
  const downloadUuids = (format: 'json' | 'csv' | 'txt') => {
    if (!isBackerUser) {
      toast.error('Backer Feature Required', {
        description: 'Download functionality is a backer feature. Please become a backer to access this feature.'
      });
      return;
    }

    const data = generatedUuids.map(entry => ({
      uuid: entry.uuid,
      version: entry.version,
      format: entry.format,
      timestamp: entry.timestamp.toISOString(),
      namespace: entry.namespace,
      name: entry.name
    }));

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = 'uuids.json';
        mimeType = 'application/json';
        break;
      case 'csv':
        content = 'UUID,Version,Format,Timestamp,Namespace,Name\n' +
          data.map(row => `"${row.uuid}","${row.version}","${row.format}","${row.timestamp}","${row.namespace || ''}","${row.name || ''}"`).join('\n');
        filename = 'uuids.csv';
        mimeType = 'text/csv';
        break;
      case 'txt':
        content = data.map(row => `${row.uuid} (${row.version}, ${row.format})`).join('\n');
        filename = 'uuids.txt';
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess('Download Complete', `UUIDs downloaded as ${filename}`);
  };

  // Event handlers
  const handleGenerate = () => {
    generateUuid(uuidVersion, uuidFormat, namespace, name);
  };

  const handleCopy = () => {
    if (currentUuid) {
      copyToClipboard(currentUuid);
    }
  };

  const handleBulkGenerate = () => {
    if (!isBackerUser) {
      toast.error('Backer Feature Required', {
        description: 'Bulk generation is a backer feature. Please become a backer to access this feature.'
      });
      return;
    }
    setIsBulkGeneratorOpen(true);
  };

  const handleNamespaceManager = () => {
    if (!isBackerUser) {
      toast.error('Backer Feature Required', {
        description: 'Namespace management is a backer feature. Please become a backer to access this feature.'
      });
      return;
    }
    setIsNamespaceManagerOpen(true);
  };

  const handleHistory = () => {
    if (!isBackerUser) {
      toast.error('Backer Feature Required', {
        description: 'UUID history is a backer feature. Please become a backer to access this feature.'
      });
      return;
    }
    setIsHistoryOpen(true);
  };

  const handleHelp = () => {
    setIsHelpOpen(true);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          setIsHelpOpen(true);
          break;
        case 'g':
          if (e.ctrlKey) {
            e.preventDefault();
            handleGenerate();
          }
          break;
        case 'c':
          if (e.ctrlKey) {
            e.preventDefault();
            handleCopy();
          }
          break;
        case 'b':
          if (e.ctrlKey) {
            e.preventDefault();
            handleBulkGenerate();
          }
          break;
        case 'Escape':
          setIsHelpOpen(false);
          setIsBulkGeneratorOpen(false);
          setIsNamespaceManagerOpen(false);
          setIsHistoryOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [uuidVersion, uuidFormat, namespace, name]);

  // Generate initial UUID on mount
  useEffect(() => {
    generateUuid('v4', 'standard');
  }, []);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validationErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Generation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            UUID Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Generation Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="uuid-version" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">UUID Version</Label>
              <Select value={uuidVersion} onValueChange={(value: UuidVersion) => setUuidVersion(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">V1 (Timestamp-based)</SelectItem>
                  <SelectItem value="v3">V3 (MD5-based)</SelectItem>
                  <SelectItem value="v4">V4 (Random)</SelectItem>
                  <SelectItem value="v5">V5 (SHA-1-based)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="uuid-format" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Output Format</Label>
              <Select value={uuidFormat} onValueChange={(value: UuidFormat) => setUuidFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)</SelectItem>
                  <SelectItem value="compact">Compact (xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)</SelectItem>
                  <SelectItem value="base64">Base64</SelectItem>
                  <SelectItem value="binary">Binary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Namespace and Name for V3/V5 */}
          {(uuidVersion === 'v3' || uuidVersion === 'v5') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="namespace" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Namespace UUID</Label>
                <Input
                  id="namespace"
                  value={namespace}
                  onChange={(e) => setNamespace(e.target.value)}
                  placeholder="6ba7b810-9dad-11d1-80b4-00c04fd430c8"
                />
              </div>
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="example"
                />
              </div>
            </div>
          )}

          {/* Generated UUID Display */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Generated UUID</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border font-mono text-sm break-all">
                {currentUuid || 'Click Generate to create a UUID'}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!currentUuid}
                aria-label="Copy UUID"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
            {isGenerating ? (
              <Spinner />
            ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Generate UUID
            </Button>

            <Button
              variant="outline"
              onClick={handleBulkGenerate}
              disabled={!isBackerUser}
              className="flex items-center gap-2"
            >
              {!isBackerUser && <Crown className="w-4 h-4 animate-pulse" />}
              <Zap className="w-4 h-4" />
              Bulk Generate
            </Button>

            <Button
              variant="outline"
              onClick={handleNamespaceManager}
              disabled={!isBackerUser}
              className="flex items-center gap-2"
            >
              {!isBackerUser && <Crown className="w-4 h-4 animate-pulse" />}
              <Database className="w-4 h-4" />
              Namespaces
            </Button>

            <Button
              variant="outline"
              onClick={handleHistory}
              disabled={!isBackerUser}
              className="flex items-center gap-2"
            >
              {!isBackerUser && <Crown className="w-4 h-4 animate-pulse" />}
              <History className="w-4 h-4" />
              History
            </Button>

            <Button
              variant="outline"
              onClick={handleHelp}
              className="flex items-center gap-2 ml-auto"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent UUIDs */}
      {generatedUuids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent UUIDs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generatedUuids.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex-1">
                    <div className="font-mono text-sm break-all">{entry.uuid}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{entry.version.toUpperCase()}</Badge>
                      <Badge variant="outline">{entry.format}</Badge>
                      <span className="text-xs text-gray-500">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(entry.uuid)}
                    aria-label="Copy UUID"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Options for Backer Users */}
      {isBackerUser && generatedUuids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export UUIDs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => downloadUuids('json')}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadUuids('csv')}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadUuids('txt')}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                TXT
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <BulkGenerator isOpen={isBulkGeneratorOpen} onClose={() => setIsBulkGeneratorOpen(false)} />
      <NamespaceManager isOpen={isNamespaceManagerOpen} onClose={() => setIsNamespaceManagerOpen(false)} />
      <UuidHistory isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  );
} 