'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  X, 
  Download, 
  Copy, 
  Loader2, 
  Zap,
  AlertCircle,
  Check,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BulkUuidEntry {
  id: string;
  uuid: string;
  version: string;
  format: string;
  timestamp: Date;
}

type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5';
type UuidFormat = 'standard' | 'compact' | 'base64' | 'binary';

export default function BulkGenerator({ isOpen, onClose }: BulkGeneratorProps) {

  const [count, setCount] = useState<number>(10);
  const [version, setVersion] = useState<UuidVersion>('v4');
  const [format, setFormat] = useState<UuidFormat>('standard');
  const [namespace, setNamespace] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [generatedUuids, setGeneratedUuids] = useState<BulkUuidEntry[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // UUID Generation Functions (same as main component)
  const generateUuidV1 = async (): Promise<string> => {
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
    const combined = namespace + name;
    const hash = await crypto.subtle.digest('MD5', new TextEncoder().encode(combined));
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `${hashHex.slice(0, 8)}-${hashHex.slice(8, 12)}-${(parseInt(hashHex.slice(12, 16), 16) & 0x0fff | 0x3000).toString(16).padStart(4, '0')}-${(parseInt(hashHex.slice(16, 18), 16) & 0x3f | 0x80).toString(16).padStart(2, '0')}${hashHex.slice(18, 20)}-${hashHex.slice(20, 32)}`;
  };

  const generateUuidV4 = async (): Promise<string> => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    
    array[6] = (array[6] & 0x0f) | 0x40;
    array[8] = (array[8] & 0x3f) | 0x80;
    
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  };

  const generateUuidV5 = async (namespace: string, name: string): Promise<string> => {
    const combined = namespace + name;
    const hash = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(combined));
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `${hashHex.slice(0, 8)}-${hashHex.slice(8, 12)}-${(parseInt(hashHex.slice(12, 16), 16) & 0x0fff | 0x5000).toString(16).padStart(4, '0')}-${(parseInt(hashHex.slice(16, 18), 16) & 0x3f | 0x80).toString(16).padStart(2, '0')}${hashHex.slice(18, 20)}-${hashHex.slice(20, 32)}`;
  };

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

  const validateInputs = (): string[] => {
    const errors: string[] = [];
    
    if (count < 1 || count > 1000) {
      errors.push('Count must be between 1 and 1000');
    }
    
    if ((version === 'v3' || version === 'v5') && !namespace.trim()) {
      errors.push('Namespace is required for V3/V5 UUIDs');
    }
    
    if ((version === 'v3' || version === 'v5') && !name.trim()) {
      errors.push('Name is required for V3/V5 UUIDs');
    }
    
    return errors;
  };

  const generateBulkUuids = useCallback(async () => {
    const errors = validateInputs();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setValidationErrors([]);
    setGeneratedUuids([]);

    const uuids: BulkUuidEntry[] = [];
    const totalCount = count;

    for (let i = 0; i < totalCount; i++) {
      try {
        let uuid: string;
        
        switch (version) {
          case 'v1':
            uuid = await generateUuidV1();
            break;
          case 'v3':
            uuid = await generateUuidV3(namespace, name);
            break;
          case 'v4':
            uuid = await generateUuidV4();
            break;
          case 'v5':
            uuid = await generateUuidV5(namespace, name);
            break;
          default:
            uuid = await generateUuidV4();
        }

        const formattedUuid = formatUuid(uuid, format);
        
        uuids.push({
          id: `${Date.now()}-${i}`,
          uuid: formattedUuid,
          version,
          format,
          timestamp: new Date()
        });

        setProgress(((i + 1) / totalCount) * 100);
        setGeneratedUuids([...uuids]);

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        console.error('Error generating UUID:', error);
        setValidationErrors(['Failed to generate UUID. Please try again.']);
        break;
      }
    }

    setIsGenerating(false);
    
    if (uuids.length > 0) {
      toast.success('Bulk Generation Complete', {
        description: `Generated ${uuids.length} UUIDs successfully`
      });
    }
  }, [count, version, format, namespace, name, toast]);

  const copyAllUuids = async () => {
    const uuidList = generatedUuids.map(entry => entry.uuid).join('\n');
    try {
      await navigator.clipboard.writeText(uuidList);
      toast.success('Copied to Clipboard', {
        description: `Copied ${generatedUuids.length} UUIDs to clipboard`
      });
    } catch (error) {
      toast.error('Copy Failed', {
        description: 'Failed to copy UUIDs to clipboard'
      });
    }
  };

  const downloadUuids = (format: 'json' | 'csv' | 'txt') => {
    const data = generatedUuids.map(entry => ({
      uuid: entry.uuid,
      version: entry.version,
      format: entry.format,
      timestamp: entry.timestamp.toISOString()
    }));

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = `bulk-uuids-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = 'UUID,Version,Format,Timestamp\n' +
          data.map(row => `"${row.uuid}","${row.version}","${row.format}","${row.timestamp}"`).join('\n');
        filename = `bulk-uuids-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      case 'txt':
        content = data.map(row => `${row.uuid} (${row.version}, ${row.format})`).join('\n');
        filename = `bulk-uuids-${Date.now()}.txt`;
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

    toast.success('Download Complete', {
      description: `UUIDs downloaded as ${filename}`
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Bulk UUID Generator
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close bulk generator"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Error Display */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {validationErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* Generation Options */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Generation Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="count">Count (1-1000)</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="1000"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  disabled={isGenerating}
                />
              </div>
              
              <div>
                <Label htmlFor="version">UUID Version</Label>
                <Select value={version} onValueChange={(value: UuidVersion) => setVersion(value)} disabled={isGenerating}>
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
                <Label htmlFor="format">Output Format</Label>
                <Select value={format} onValueChange={(value: UuidFormat) => setFormat(value)} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="base64">Base64</SelectItem>
                    <SelectItem value="binary">Binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Namespace and Name for V3/V5 */}
            {(version === 'v3' || version === 'v5') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="namespace">Namespace UUID</Label>
                  <Input
                    id="namespace"
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                    placeholder="6ba7b810-9dad-11d1-80b4-00c04fd430c8"
                    disabled={isGenerating}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="example"
                    disabled={isGenerating}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={generateBulkUuids}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating... ({Math.round(progress)}%)
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate {count} UUIDs
                </>
              )}
            </Button>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {generatedUuids.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated UUIDs ({generatedUuids.length})</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAllUuids}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadUuids('json')}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadUuids('csv')}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadUuids('txt')}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    TXT
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {generatedUuids.map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex-1">
                      <div className="font-mono text-sm break-all">{entry.uuid}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {entry.version.toUpperCase()} • {entry.format} • {entry.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(entry.uuid)}
                      aria-label="Copy UUID"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} aria-label="Close bulk generator">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 