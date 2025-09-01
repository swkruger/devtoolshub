'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  XCircle, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  User, 
  Shield,
  Copy,
  ExternalLink
} from 'lucide-react';

interface TokenInspectorProps {
  jwt: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ClaimInfo {
  name: string;
  value: any;
  type: 'standard' | 'custom' | 'header';
  description: string;
  category: string;
  documentation?: string;
  warning?: string;
  status?: 'valid' | 'warning' | 'error';
}

const STANDARD_CLAIMS: Record<string, { description: string; category: string; documentation?: string }> = {
  // Header claims
  alg: { description: 'Algorithm used for signing the token', category: 'Security' },
  typ: { description: 'Type of token (usually "JWT")', category: 'Security' },
  kid: { description: 'Key ID for key rotation', category: 'Security' },
  x5t: { description: 'X.509 certificate thumbprint', category: 'Security' },
  
  // Payload claims
  iss: { description: 'Issuer of the token', category: 'Identity' },
  sub: { description: 'Subject (user ID) of the token', category: 'Identity' },
  aud: { description: 'Audience (intended recipient)', category: 'Identity' },
  exp: { description: 'Expiration time (Unix timestamp)', category: 'Timing' },
  nbf: { description: 'Not before time (Unix timestamp)', category: 'Timing' },
  iat: { description: 'Issued at time (Unix timestamp)', category: 'Timing' },
  jti: { description: 'JWT ID (unique identifier)', category: 'Identity' },
  
  // Common custom claims
  name: { description: 'Full name of the user', category: 'Profile' },
  given_name: { description: 'First name of the user', category: 'Profile' },
  family_name: { description: 'Last name of the user', category: 'Profile' },
  email: { description: 'Email address of the user', category: 'Profile' },
  email_verified: { description: 'Whether email is verified', category: 'Profile' },
  picture: { description: 'Profile picture URL', category: 'Profile' },
  locale: { description: 'User locale/language', category: 'Profile' },
  updated_at: { description: 'Last profile update time', category: 'Profile' },
  
  // OAuth/OIDC claims
  azp: { description: 'Authorized party (OAuth client ID)', category: 'OAuth' },
  scope: { description: 'OAuth scopes granted', category: 'OAuth' },
  client_id: { description: 'OAuth client identifier', category: 'OAuth' },
  
  // Custom application claims
  role: { description: 'User role or permission level', category: 'Authorization' },
  permissions: { description: 'List of user permissions', category: 'Authorization' },
  tenant_id: { description: 'Multi-tenant organization ID', category: 'Organization' },
  org_id: { description: 'Organization identifier', category: 'Organization' },
};

export function TokenInspector({ jwt, isOpen, onClose }: TokenInspectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const decodeJWT = (token: string) => {
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
  };

  const { header, payload, error } = decodeJWT(jwt);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-red-600" />
                <CardTitle>Token Inspector</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Cannot inspect token: {error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getClaimInfo = (name: string, value: any, type: 'header' | 'payload'): ClaimInfo => {
    const standardInfo = STANDARD_CLAIMS[name];
    const isStandard = !!standardInfo;
    
    let description = standardInfo?.description || 'Custom claim';
    let category = standardInfo?.category || 'Custom';
    let status: 'valid' | 'warning' | 'error' = 'valid';
    let warning: string | undefined;

    // Add specific warnings and validations
    if (name === 'exp') {
      const now = Math.floor(Date.now() / 1000);
      if (value < now) {
        status = 'error';
        warning = 'Token has expired';
      } else if (value < now + 300) { // 5 minutes
        status = 'warning';
        warning = 'Token expires soon';
      }
    }

    if (name === 'nbf' && value > Math.floor(Date.now() / 1000)) {
      status = 'warning';
      warning = 'Token is not yet valid';
    }

    if (name === 'iat' && value > Math.floor(Date.now() / 1000)) {
      status = 'warning';
      warning = 'Token issued in the future';
    }

    return {
      name,
      value,
      type: isStandard ? 'standard' : 'custom',
      description,
      category,
      documentation: standardInfo?.documentation,
      warning,
      status
    };
  };

  const allClaims: ClaimInfo[] = [
    ...Object.entries(header || {}).map(([name, value]) => getClaimInfo(name, value, 'header')),
    ...Object.entries(payload || {}).map(([name, value]) => getClaimInfo(name, value, 'payload'))
  ];

  const categories = ['all', ...Array.from(new Set(allClaims.map(c => c.category)))];
  
  const filteredClaims = allClaims.filter(claim => {
    const matchesSearch = claim.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || claim.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyClaimValue = (claim: ClaimInfo) => {
    const value = typeof claim.value === 'object' ? JSON.stringify(claim.value) : String(claim.value);
    navigator.clipboard.writeText(value);
  };

  const formatValue = (value: any, claimName?: string): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'number' && claimName && (claimName === 'exp' || claimName === 'iat' || claimName === 'nbf')) {
      return `${value} (${new Date(value * 1000).toLocaleString()})`;
    }
    return String(value);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              <CardTitle>Token Inspector</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Detailed analysis of JWT claims with explanations and validations
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border border-border rounded-lg bg-background text-foreground"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{allClaims.length}</div>
              <div className="text-sm text-blue-600">Total Claims</div>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {allClaims.filter(c => c.type === 'standard').length}
              </div>
              <div className="text-sm text-green-600">Standard</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {allClaims.filter(c => c.type === 'custom').length}
              </div>
              <div className="text-sm text-purple-600">Custom</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {allClaims.filter(c => c.status === 'warning' || c.status === 'error').length}
              </div>
              <div className="text-sm text-orange-600">Issues</div>
            </div>
          </div>

          {/* Claims List */}
          <div className="space-y-3">
            {filteredClaims.map((claim, index) => (
              <Card key={index} className={`border ${
                claim.status === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
                claim.status === 'warning' ? 'border-orange-200 bg-orange-50 dark:bg-orange-950/20' :
                'border-gray-200 dark:border-gray-700'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{claim.name}</h3>
                        <Badge variant={claim.type === 'standard' ? 'default' : 'secondary'}>
                          {claim.type}
                        </Badge>
                        <Badge variant="outline">{claim.category}</Badge>
                        {claim.status === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                        {claim.status === 'warning' && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                        {claim.status === 'valid' && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{claim.description}</p>
                      
                      <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                        <pre className="whitespace-pre-wrap break-all">{formatValue(claim.value, claim.name)}</pre>
                      </div>
                      
                      {claim.warning && (
                        <Alert className="mt-2 border-orange-200 bg-orange-50">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-orange-800">
                            {claim.warning}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Tooltip content="Copy claim value">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyClaimValue(claim)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      
                      {claim.documentation && (
                        <Tooltip content="View documentation">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(claim.documentation, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredClaims.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No claims found matching your search criteria</p>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium mb-1">Token Inspector Tips:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Standard claims are defined by RFC 7519 and have specific meanings</li>
                  <li>• Custom claims are application-specific and may vary</li>
                  <li>• Pay attention to timing claims (exp, nbf, iat) for security</li>
                  <li>• Use the search to find specific claims quickly</li>
                  <li>• Filter by category to focus on specific claim types</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 