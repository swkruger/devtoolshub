'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, Download, Copy, XCircle, CheckCircle, AlertTriangle, FileUp, Trash2 } from 'lucide-react';

interface BulkDecodeProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DecodedJWT {
  original: string;
  header: any;
  payload: any;
  signature: string;
  isValid: boolean;
  error?: string;
  index: number;
}

interface BulkDecodeResult {
  total: number;
  valid: number;
  invalid: number;
  results: DecodedJWT[];
}

export function BulkDecode({ isOpen, onClose }: BulkDecodeProps) {
  const [jwts, setJwts] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BulkDecodeResult | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const decodeJWT = (token: string): { header: any; payload: any; signature: string; error?: string } => {
    try {
      const [header, payload, signature] = token.split(".");
      if (!header || !payload) throw new Error("Invalid JWT structure");
      const decode = (str: string) => JSON.parse(atob(str.replace(/-/g, "+").replace(/_/g, "/")));
      return {
        header: decode(header),
        payload: decode(payload),
        signature: signature || "",
        error: undefined
      };
    } catch (e: any) {
      return { header: null, payload: null, signature: "", error: e.message };
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      setJwts(prev => [...prev, ...lines]);
    };
    reader.readAsText(file);
  };

  const handlePaste = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = event.target.value;
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    setJwts(lines);
  };

  const removeJWT = (index: number) => {
    setJwts(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setJwts([]);
    setResults(null);
  };

  const processJWTs = async () => {
    if (jwts.length === 0) return;

    setIsProcessing(true);
    setResults(null);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const decodedResults: DecodedJWT[] = jwts.map((jwt, index) => {
        const decoded = decodeJWT(jwt);
        return {
          original: jwt,
          header: decoded.header,
          payload: decoded.payload,
          signature: decoded.signature,
          isValid: !decoded.error,
          error: decoded.error,
          index: index + 1
        };
      });

      const validCount = decodedResults.filter(r => r.isValid).length;
      const invalidCount = decodedResults.length - validCount;

      setResults({
        total: decodedResults.length,
        valid: validCount,
        invalid: invalidCount,
        results: decodedResults
      });
    } catch (error) {
      console.error('Error processing JWTs:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const exportResults = () => {
    if (!results) return;

    let content = '';
    let filename = '';

    if (exportFormat === 'csv') {
      // CSV format
      const headers = ['Index', 'Valid', 'Algorithm', 'Subject', 'Issued At', 'Expires At', 'Error'];
      content = headers.join(',') + '\n';
      
      results.results.forEach(result => {
        const row = [
          result.index,
          result.isValid ? 'Yes' : 'No',
          result.header?.alg || 'N/A',
          result.payload?.sub || 'N/A',
          result.payload?.iat ? new Date(result.payload.iat * 1000).toISOString() : 'N/A',
          result.payload?.exp ? new Date(result.payload.exp * 1000).toISOString() : 'N/A',
          result.error || 'N/A'
        ];
        content += row.map(field => `"${field}"`).join(',') + '\n';
      });
      
      filename = `jwt-bulk-decode-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      // JSON format
      content = JSON.stringify(results, null, 2);
      filename = `jwt-bulk-decode-${new Date().toISOString().split('T')[0]}.json`;
    }

    const blob = new Blob([content], { type: exportFormat === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyResults = () => {
    if (!results) return;
    
    const summary = `Bulk JWT Decode Results:
Total: ${results.total}
Valid: ${results.valid}
Invalid: ${results.invalid}

${results.results.map(r => `${r.index}. ${r.isValid ? '✓' : '✗'} ${r.payload?.sub || 'N/A'} (${r.header?.alg || 'N/A'})`).join('\n')}`;
    
    navigator.clipboard.writeText(summary);
  };

  const handleClose = () => {
    setJwts([]);
    setResults(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <CardTitle>Bulk JWT Decode</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Upload or paste multiple JWTs to decode them all at once
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileUp className="w-4 h-4" />
                Upload File
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                className="flex items-center gap-2"
                disabled={jwts.length === 0}
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
              <span className="text-sm text-muted-foreground">
                {jwts.length} JWT{jwts.length !== 1 ? 's' : ''} loaded
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="space-y-2">
              <Label>Or paste JWTs (one per line)</Label>
              <textarea
                value={jwts.join('\n')}
                onChange={handlePaste}
                placeholder="Paste your JWTs here, one per line..."
                className="w-full h-32 p-3 border rounded-lg font-mono text-sm resize-none"
              />
            </div>

            <Button
              onClick={processJWTs}
              disabled={isProcessing || jwts.length === 0}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Processing {jwts.length} JWT{jwts.length !== 1 ? 's' : ''}...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Decode {jwts.length} JWT{jwts.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          {results && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.total}</div>
                  <div className="text-sm text-blue-600">Total</div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{results.valid}</div>
                  <div className="text-sm text-green-600">Valid</div>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{results.invalid}</div>
                  <div className="text-sm text-red-600">Invalid</div>
                </div>
              </div>

              {/* Export Options */}
              <div className="flex items-center gap-4">
                <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportResults} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button onClick={copyResults} variant="outline" className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Summary
                </Button>
              </div>

              {/* Results List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.results.map((result) => (
                  <div
                    key={result.index}
                    className={`p-3 rounded-lg border ${
                      result.isValid 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.isValid ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium">#{result.index}</span>
                        <span className="text-sm text-muted-foreground">
                          {result.payload?.sub || 'No subject'}
                        </span>
                        {result.header?.alg && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {result.header.alg}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeJWT(result.index - 1)}
                      >
                        <XCircle className="w-3 h-3" />
                      </Button>
                    </div>
                    {result.error && (
                      <div className="mt-2 text-sm text-red-600">
                        Error: {result.error}
                      </div>
                    )}
                    {result.isValid && result.payload?.exp && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Expires: {new Date(result.payload.exp * 1000).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium mb-1">Bulk Decode Tips:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Upload a text file with one JWT per line</li>
                  <li>• Or paste multiple JWTs directly into the text area</li>
                  <li>• Export results as CSV for spreadsheet analysis</li>
                  <li>• Export as JSON for programmatic processing</li>
                  <li>• Invalid JWTs will show error messages</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 