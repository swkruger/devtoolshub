'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, Copy, Download } from 'lucide-react';

interface JwtCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALGORITHMS = [
  { value: 'HS256', label: 'HMAC SHA-256 (HS256)', type: 'symmetric' },
  { value: 'HS384', label: 'HMAC SHA-384 (HS384)', type: 'symmetric' },
  { value: 'HS512', label: 'HMAC SHA-512 (HS512)', type: 'symmetric' },
  { value: 'RS256', label: 'RSA SHA-256 (RS256)', type: 'asymmetric' },
  { value: 'RS384', label: 'RSA SHA-384 (RS384)', type: 'asymmetric' },
  { value: 'RS512', label: 'RSA SHA-512 (RS512)', type: 'asymmetric' },
  { value: 'ES256', label: 'ECDSA SHA-256 (ES256)', type: 'asymmetric' },
  { value: 'ES384', label: 'ECDSA SHA-384 (ES384)', type: 'asymmetric' },
  { value: 'ES512', label: 'ECDSA SHA-512 (ES512)', type: 'asymmetric' },
];

const DEFAULT_HEADER = {
  alg: 'HS256',
  typ: 'JWT'
};

const DEFAULT_PAYLOAD = {
  sub: 'user123',
  name: 'John Doe',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours from now
};

export function JwtCreation({ isOpen, onClose }: JwtCreationProps) {
  const [algorithm, setAlgorithm] = useState('HS256');
  const [secretKey, setSecretKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [headerJson, setHeaderJson] = useState(JSON.stringify(DEFAULT_HEADER, null, 2));
  const [payloadJson, setPayloadJson] = useState(JSON.stringify(DEFAULT_PAYLOAD, null, 2));
  const [isCreating, setIsCreating] = useState(false);
  const [createdJWT, setCreatedJWT] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedAlgo = ALGORITHMS.find(algo => algo.value === algorithm);
  const isSymmetric = selectedAlgo?.type === 'symmetric';

  const validateJson = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  const createJWT = async () => {
    setIsCreating(true);
    setError('');
    setCreatedJWT('');

    try {
      // Validate JSON
      if (!validateJson(headerJson)) {
        throw new Error('Invalid header JSON');
      }
      if (!validateJson(payloadJson)) {
        throw new Error('Invalid payload JSON');
      }

      const header = JSON.parse(headerJson);
      const payload = JSON.parse(payloadJson);

      // Update algorithm in header
      header.alg = algorithm;

      // Check if key is provided
      const key = isSymmetric ? secretKey : privateKey;
      if (!key) {
        throw new Error(`Please provide a ${isSymmetric ? 'secret key' : 'private key'}`);
      }

      // For now, simulate JWT creation (in real implementation, use crypto libraries)
      // This is a placeholder - actual creation would use Web Crypto API or a library like jose
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate JWT creation
      const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      
      // Simulate signature (in real implementation, this would be the actual signature)
      const signature = btoa('simulated_signature_' + Date.now()).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      
      const jwt = `${headerB64}.${payloadB64}.${signature}`;
      setCreatedJWT(jwt);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const copyJWT = () => {
    if (createdJWT) {
      navigator.clipboard.writeText(createdJWT);
      // TODO: Show toast notification
    }
  };

  const downloadJWT = () => {
    if (createdJWT) {
      const blob = new Blob([createdJWT], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jwt-token.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleClose = () => {
    setCreatedJWT('');
    setError('');
    setSecretKey('');
    setPrivateKey('');
    setHeaderJson(JSON.stringify(DEFAULT_HEADER, null, 2));
    setPayloadJson(JSON.stringify(DEFAULT_PAYLOAD, null, 2));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              <CardTitle>Create JWT</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Build and encode a new JWT with custom header, payload, and signing
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Configuration */}
            <div className="space-y-6">
              {/* Algorithm Selection */}
              <div className="space-y-2">
                <Label htmlFor="algorithm">Algorithm</Label>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALGORITHMS.map((algo) => (
                      <SelectItem key={algo.value} value={algo.value}>
                        {algo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {isSymmetric ? 'Symmetric algorithm - requires secret key' : 'Asymmetric algorithm - requires private key'}
                </p>
              </div>

              {/* Key Input */}
              <div className="space-y-2">
                <Label htmlFor="key">
                  {isSymmetric ? 'Secret Key' : 'Private Key'}
                </Label>
                <div className="relative">
                  <Input
                    id="key"
                    type={isSymmetric ? (showSecret ? 'text' : 'password') : (showPrivate ? 'text' : 'password')}
                    placeholder={isSymmetric ? 'Enter your secret key' : 'Enter your private key'}
                    value={isSymmetric ? secretKey : privateKey}
                    onChange={(e) => isSymmetric ? setSecretKey(e.target.value) : setPrivateKey(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => isSymmetric ? setShowSecret(!showSecret) : setShowPrivate(!showPrivate)}
                  >
                    {isSymmetric ? (showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />) : 
                                   (showPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />)}
                  </Button>
                </div>
              </div>

              {/* Header JSON */}
              <div className="space-y-2">
                <Label htmlFor="header">Header (JSON)</Label>
                <textarea
                  id="header"
                  value={headerJson}
                  onChange={(e) => setHeaderJson(e.target.value)}
                  className="w-full h-32 p-3 border rounded-lg font-mono text-sm resize-none"
                  placeholder="Enter JWT header as JSON"
                />
                {!validateJson(headerJson) && headerJson && (
                  <p className="text-xs text-red-600">Invalid JSON format</p>
                )}
              </div>

              {/* Payload JSON */}
              <div className="space-y-2">
                <Label htmlFor="payload">Payload (JSON)</Label>
                <textarea
                  id="payload"
                  value={payloadJson}
                  onChange={(e) => setPayloadJson(e.target.value)}
                  className="w-full h-32 p-3 border rounded-lg font-mono text-sm resize-none"
                  placeholder="Enter JWT payload as JSON"
                />
                {!validateJson(payloadJson) && payloadJson && (
                  <p className="text-xs text-red-600">Invalid JSON format</p>
                )}
              </div>

              {/* Create Button */}
              <Button
                onClick={createJWT}
                disabled={isCreating || !validateJson(headerJson) || !validateJson(payloadJson) || (!isSymmetric ? !privateKey : !secretKey)}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Creating JWT...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Create JWT
                  </>
                )}
              </Button>
            </div>

            {/* Right Column - Result */}
            <div className="space-y-6">
              {/* Error Display */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Created JWT */}
              {createdJWT && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Generated JWT</Label>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={copyJWT}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadJWT}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-xs break-all whitespace-pre-wrap">{createdJWT}</code>
                  </div>
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      JWT created successfully! You can now copy or download it.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Tips */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <div className="font-medium mb-1">JWT Creation Tips:</div>
                    <ul className="space-y-1 text-xs">
                      <li>• The &apos;alg&apos; field in the header will be automatically set to your selected algorithm</li>
                      <li>• Common payload fields: sub (subject), iat (issued at), exp (expiration)</li>
                      <li>• Use iat: Math.floor(Date.now() / 1000) for current timestamp</li>
                      <li>• Set exp to iat + seconds for expiration time</li>
                      <li>• Keep your keys secure and never share private keys</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 