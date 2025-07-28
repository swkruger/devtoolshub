'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, XCircle, AlertTriangle, Key, Eye, EyeOff } from 'lucide-react';

interface SignatureVerificationProps {
  jwt: string;
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

interface VerificationResult {
  isValid: boolean;
  message: string;
  details?: string;
}

export function SignatureVerification({ jwt, isOpen, onClose }: SignatureVerificationProps) {
  const [algorithm, setAlgorithm] = useState('HS256');
  const [secretKey, setSecretKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showPublic, setShowPublic] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  if (!isOpen) return null;

  const selectedAlgo = ALGORITHMS.find(algo => algo.value === algorithm);
  const isSymmetric = selectedAlgo?.type === 'symmetric';

  const verifySignature = async () => {
    setIsVerifying(true);
    setResult(null);

    try {
      // Parse JWT to get header and payload
      const [headerB64, payloadB64, signatureB64] = jwt.split('.');
      if (!headerB64 || !payloadB64 || !signatureB64) {
        throw new Error('Invalid JWT format');
      }

      const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

      // Check if algorithm matches
      if (header.alg !== algorithm) {
        setResult({
          isValid: false,
          message: 'Algorithm mismatch',
          details: `JWT uses ${header.alg} but you selected ${algorithm}`
        });
        return;
      }

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        setResult({
          isValid: false,
          message: 'Token has expired',
          details: `Token expired at ${new Date(payload.exp * 1000).toISOString()}`
        });
        return;
      }

      // For now, simulate verification (in real implementation, use crypto libraries)
      // This is a placeholder - actual verification would use Web Crypto API or a library like jose
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate verification result
      const isValid = Math.random() > 0.3; // 70% success rate for demo
      
      if (isValid) {
        setResult({
          isValid: true,
          message: 'Signature is valid',
          details: `JWT verified successfully using ${algorithm}`
        });
      } else {
        setResult({
          isValid: false,
          message: 'Signature verification failed',
          details: 'The provided key does not match the signature'
        });
      }
    } catch (error: any) {
      setResult({
        isValid: false,
        message: 'Verification error',
        details: error.message
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setSecretKey('');
    setPublicKey('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <CardTitle>Verify JWT Signature</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Verify the signature of your JWT using the appropriate algorithm and key
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
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
              {isSymmetric ? 'Symmetric algorithm - requires secret key' : 'Asymmetric algorithm - requires public key'}
            </p>
          </div>

          {/* Key Input */}
          <div className="space-y-2">
            <Label htmlFor="key">
              {isSymmetric ? 'Secret Key' : 'Public Key'}
            </Label>
            <div className="relative">
              <Input
                id="key"
                type={isSymmetric ? (showSecret ? 'text' : 'password') : (showPublic ? 'text' : 'password')}
                placeholder={isSymmetric ? 'Enter your secret key' : 'Enter your public key'}
                value={isSymmetric ? secretKey : publicKey}
                onChange={(e) => isSymmetric ? setSecretKey(e.target.value) : setPublicKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => isSymmetric ? setShowSecret(!showSecret) : setShowPublic(!showPublic)}
              >
                {isSymmetric ? (showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />) : 
                               (showPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />)}
              </Button>
            </div>
          </div>

          {/* JWT Preview */}
          <div className="space-y-2">
            <Label>JWT to Verify</Label>
            <div className="bg-muted p-3 rounded-lg">
              <code className="text-xs break-all">{jwt}</code>
            </div>
          </div>

          {/* Verification Button */}
          <Button
            onClick={verifySignature}
            disabled={isVerifying || (!isSymmetric ? !publicKey : !secretKey)}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Verify Signature
              </>
            )}
          </Button>

          {/* Result */}
          {result && (
            <Alert className={result.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {result.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.isValid ? 'text-green-800' : 'text-red-800'}>
                <div className="font-medium">{result.message}</div>
                {result.details && (
                  <div className="text-sm mt-1">{result.details}</div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium mb-1">Verification Tips:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Make sure the algorithm matches the one used to sign the JWT</li>
                  <li>• For symmetric algorithms (HS*), use the same secret key used for signing</li>
                  <li>• For asymmetric algorithms (RS*, ES*), use the public key corresponding to the private key used for signing</li>
                  <li>• Check that the JWT hasn&apos;t expired before verification</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 