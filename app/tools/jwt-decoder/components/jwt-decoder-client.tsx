'use client';

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Crown, Shield, Download, Upload, Save, FolderOpen, Key, FileText, Search } from "lucide-react";
import JwtEditor from "./jwt-editor";
import HelpPanel from "./help-panel";
import { SignatureVerification } from "./signature-verification";
import { JwtCreation } from "./jwt-creation";
import { BulkDecode } from "./bulk-decode";
import { TokenInspector } from "./token-inspector";
import { JwtSnippetsManager } from "./jwt-snippets-manager";
import { HelpCircle } from "lucide-react";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface JwtDecoderClientProps {
  isPremiumUser: boolean;
  userId?: string;
}

function decodeJWT(token: string) {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload) throw new Error("Invalid JWT structure");
    const decode = (str: string) => JSON.parse(atob(str.replace(/-/g, "+").replace(/_/g, "/")));
    return {
      header: decode(header),
      payload: decode(payload),
      signature: signature || "",
      error: null
    };
  } catch (e: any) {
    return { header: null, payload: null, signature: null, error: e.message };
  }
}

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoderClient({ isPremiumUser, userId }: JwtDecoderClientProps) {
  const [jwt, setJwt] = useState("");
  const [touched, setTouched] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSignatureVerificationOpen, setIsSignatureVerificationOpen] = useState(false);
  const [isJwtCreationOpen, setIsJwtCreationOpen] = useState(false);
  const [isBulkDecodeOpen, setIsBulkDecodeOpen] = useState(false);
  const [isTokenInspectorOpen, setIsTokenInspectorOpen] = useState(false);
  const [isJwtSnippetsManagerOpen, setIsJwtSnippetsManagerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { header, payload, signature, error } = decodeJWT(jwt.trim());

  const handleLoadSample = () => {
    setJwt(SAMPLE_JWT);
    setTouched(true);
  };
  const handleClear = () => {
    setJwt("");
    setTouched(false);
  };
  const handleCopy = () => {
    if (payload) {
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      // TODO: Show toast notification
    }
  };

  // Premium feature handlers
  const handleVerifySignature = () => {
    setIsSignatureVerificationOpen(true);
  };

  const handleCreateJWT = () => {
    setIsJwtCreationOpen(true);
  };

  const handleBulkDecode = () => {
    setIsBulkDecodeOpen(true);
  };

  const handleTokenInspector = () => {
    setIsTokenInspectorOpen(true);
  };

  const handleSaveJWT = () => {
    setIsJwtSnippetsManagerOpen(true);
  };

  const handleLoadSaved = () => {
    setIsJwtSnippetsManagerOpen(true);
  };

  const handleLoadJwtFromSnippet = (jwtToken: string) => {
    setJwt(jwtToken);
    setTouched(true);
  };

  const handleDownload = () => {
    if (!jwt) return;
    // Download the raw JWT
    const blob = new Blob([jwt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jwt-snippet-${Date.now()}.jwt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleDownloadPayload = () => {
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jwt-payload-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJwt(text.trim());
      setTouched(true);
    };
    reader.readAsText(file);
  };

  // Comprehensive keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // F1: Toggle help panel
      if (e.key === "F1") {
        e.preventDefault();
        setIsHelpOpen((open) => !open);
        return;
      }

      // Ctrl shortcuts
      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "l":
            e.preventDefault();
            handleLoadSample();
            break;
          case "r":
            e.preventDefault();
            handleClear();
            break;
          case "c":
            e.preventDefault();
            handleCopy();
            break;
          case "s":
            e.preventDefault();
            if (isPremiumUser && jwt) {
              handleSaveJWT();
            }
            break;
          case "o":
            e.preventDefault();
            if (isPremiumUser) {
              handleLoadSaved();
            }
            break;
          case "u":
            e.preventDefault();
            if (isPremiumUser) {
              handleUpload();
            }
            break;
          case "d":
            e.preventDefault();
            if (isPremiumUser && jwt) {
              handleDownload();
            }
            break;
          case "v":
            e.preventDefault();
            if (isPremiumUser && jwt) {
              handleVerifySignature();
            }
            break;
          case "i":
            e.preventDefault();
            if (isPremiumUser && jwt) {
              handleTokenInspector();
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPremiumUser, jwt, handleLoadSample, handleClear, handleCopy, handleSaveJWT, handleLoadSaved, handleUpload, handleDownload, handleVerifySignature, handleTokenInspector]);

  return (
    <div className="space-y-4" role="main" aria-label="JWT Decoder Tool">
      <div className="flex flex-wrap gap-2 mb-2 items-center">
        {/* Free Features */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={handleLoadSample} 
            type="button"
            aria-label="Load sample JWT (Ctrl+L)"
            title="Load sample JWT (Ctrl+L)"
          >
            Load Sample
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleClear} 
            type="button"
            aria-label="Clear editor (Ctrl+R)"
            title="Clear editor (Ctrl+R)"
          >
            Clear
          </Button>
        </div>

        {/* Premium Features */}
        <div className="flex gap-2">
          <Tooltip content={isPremiumUser ? "Verify JWT signature with public key (Ctrl+V)" : "Signature verification - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleVerifySignature}
              disabled={!isPremiumUser || !jwt}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Verify JWT signature (Ctrl+V)" : "Signature verification - Premium feature"}
            >
              <Shield className="w-4 h-4" />
              Verify
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />}
            </Button>
          </Tooltip>

          <Tooltip content={isPremiumUser ? "Create and encode new JWT" : "JWT creation - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateJWT}
              disabled={!isPremiumUser}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Create new JWT" : "JWT creation - Premium feature"}
            >
              <Key className="w-4 h-4" />
              Create
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />}
            </Button>
          </Tooltip>

          <Tooltip content={isPremiumUser ? "Bulk decode multiple JWTs" : "Bulk decode - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkDecode}
              disabled={!isPremiumUser}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Bulk decode JWTs" : "Bulk decode - Premium feature"}
            >
              <FileText className="w-4 h-4" />
              Bulk
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />}
            </Button>
          </Tooltip>

          <Tooltip content={isPremiumUser ? "Detailed claim analysis and explanations (Ctrl+I)" : "Token Inspector - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleTokenInspector}
              disabled={!isPremiumUser || !jwt}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Token Inspector (Ctrl+I)" : "Token Inspector - Premium feature"}
            >
              <Search className="w-4 h-4" />
              Inspector
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />}
            </Button>
          </Tooltip>

          <Tooltip content={isPremiumUser ? "Save JWT to your profile (Ctrl+S)" : "Save JWTs - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveJWT}
              disabled={!isPremiumUser || !jwt || !userId}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Save JWT snippet (Ctrl+S)" : "Save JWTs - Premium feature"}
            >
              <Save className="w-4 h-4" />
              Save
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />}
            </Button>
          </Tooltip>

          <Tooltip content={isPremiumUser ? "Load saved JWT from profile (Ctrl+O)" : "Load saved JWTs - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLoadSaved}
              disabled={!isPremiumUser || !userId}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Load saved JWTs (Ctrl+O)" : "Load saved JWTs - Premium feature"}
            >
              <FolderOpen className="w-4 h-4" />
              Load
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />}
            </Button>
          </Tooltip>

          <Tooltip content={isPremiumUser ? "Download decoded JWT as file (Ctrl+D)" : "Download - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              disabled={!isPremiumUser || !jwt}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Download JWT (Ctrl+D)" : "Download - Premium feature"}
            >
              <Download className="w-4 h-4" />
              Download
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />}
            </Button>
          </Tooltip>
          {/* Download payload button (optional, only if payload exists) */}
          {isPremiumUser && payload && (
            <Tooltip content="Download decoded payload as JSON">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadPayload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Payload
              </Button>
            </Tooltip>
          )}

          <Tooltip content={isPremiumUser ? "Upload JWT from file (Ctrl+U)" : "Upload - Premium feature"}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleUpload}
              disabled={!isPremiumUser}
              className={`flex items-center gap-2 relative transition-all duration-200 ${
                !isPremiumUser 
                  ? 'opacity-60 hover:opacity-80 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20' 
                  : 'hover:shadow-sm'
              }`}
              aria-label={isPremiumUser ? "Upload JWT file (Ctrl+U)" : "Upload - Premium feature"}
            >
              <Upload className="w-4 h-4" />
              Upload
              {!isPremiumUser && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jwt,.txt,.json"
              style={{ display: "none" }}
              onChange={handleFileChange}
              aria-label="Select JWT file to upload"
            />
          </Tooltip>
        </div>

        {/* Help Button */}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto flex items-center gap-2"
          onClick={() => setIsHelpOpen(true)}
          aria-label="Open help panel (F1)"
          title="Open help panel (F1)"
        >
          <HelpCircle className="w-4 h-4" />
          Help
        </Button>
      </div>

      <div role="region" aria-label="JWT input editor" className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">JWT</div>
        <JwtEditor
          value={jwt}
          onChange={(val) => { setJwt(val); setTouched(true); }}
          placeholder="Paste your JWT here..."
          isDarkMode={false}
        />
      </div>

      {touched && error && (
        <Alert variant="destructive" className="mt-2" role="alert" aria-live="polite">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2 inline" />
          <AlertDescription>
            <span className="font-semibold">Error:</span> {error}
          </AlertDescription>
        </Alert>
      )}

      {header && payload && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4" role="region" aria-label="Decoded JWT sections">
          <div role="region" aria-label="JWT header">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Header</div>
            <pre className="bg-muted rounded p-2 text-xs overflow-x-auto" tabIndex={0}>
              {JSON.stringify(header, null, 2)}
            </pre>
          </div>
          <div role="region" aria-label="JWT payload">
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payload</span>
              <Button 
                size="sm" 
                variant="ghost" 
                className="ml-2" 
                onClick={handleCopy} 
                type="button"
                aria-label="Copy decoded payload (Ctrl+C)"
                title="Copy decoded payload (Ctrl+C)"
              >
                Copy
              </Button>
            </div>
            <pre className="bg-muted rounded p-2 text-xs overflow-x-auto" tabIndex={0}>
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
          <div role="region" aria-label="JWT signature">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Signature</div>
            <pre className="bg-muted rounded p-2 text-xs overflow-x-auto break-all" tabIndex={0}>
              {signature}
            </pre>
          </div>
        </div>
      )}

      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <SignatureVerification 
        jwt={jwt} 
        isOpen={isSignatureVerificationOpen} 
        onClose={() => setIsSignatureVerificationOpen(false)} 
      />
      <JwtCreation 
        isOpen={isJwtCreationOpen} 
        onClose={() => setIsJwtCreationOpen(false)} 
      />
      <BulkDecode 
        isOpen={isBulkDecodeOpen} 
        onClose={() => setIsBulkDecodeOpen(false)} 
      />
      <TokenInspector 
        jwt={jwt} 
        isOpen={isTokenInspectorOpen} 
        onClose={() => setIsTokenInspectorOpen(false)} 
      />
      <JwtSnippetsManager 
        isOpen={isJwtSnippetsManagerOpen} 
        onClose={() => setIsJwtSnippetsManagerOpen(false)}
        userId={userId}
        currentJwt={jwt}
        onLoadJwt={handleLoadJwtFromSnippet}
      />
    </div>
  );
} 