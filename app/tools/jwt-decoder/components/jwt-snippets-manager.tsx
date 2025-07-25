'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  FolderOpen, 
  XCircle, 
  CheckCircle, 
  AlertTriangle, 
  Star, 
  StarOff,
  Search,
  Tag,
  Clock,
  Trash2,
  Copy,
  Edit3
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface JwtSnippetsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  currentJwt?: string;
  onLoadJwt?: (jwt: string) => void;
}

interface JwtSnippet {
  id: string;
  name: string;
  description?: string;
  jwt_token: string;
  algorithm?: string;
  expires_at?: string;
  is_favorite: boolean;
  tags?: string[];
  created_at: string;
}

export function JwtSnippetsManager({ isOpen, onClose, userId, currentJwt, onLoadJwt }: JwtSnippetsManagerProps) {
  const [snippets, setSnippets] = useState<JwtSnippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    tags: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      loadSnippets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId, searchTerm, showFavoritesOnly]);

  if (!isOpen) return null;

  async function loadSnippets() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (showFavoritesOnly) params.append('is_favorite', 'true');
      const res = await fetch(`/api/jwt-snippets?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setSnippets(data.snippets);
      } else {
        toast({ type: 'error', title: 'Error', description: data.error || 'Failed to load snippets' });
      }
    } catch (error) {
      toast({ type: 'error', title: 'Error', description: 'Failed to load snippets' });
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSnippet() {
    if (!currentJwt || !saveForm.name.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/jwt-snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveForm.name,
          description: saveForm.description,
          jwt_token: currentJwt,
          tags: saveForm.tags ? saveForm.tags.split(',').map(t => t.trim()) : [],
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSnippets(prev => [data.snippet, ...prev]);
        setSaveForm({ name: '', description: '', tags: '' });
        toast({ type: 'success', title: 'Saved', description: 'JWT snippet saved successfully.' });
      } else {
        toast({ type: 'error', title: 'Error', description: data.error || 'Failed to save snippet' });
      }
    } catch (error) {
      toast({ type: 'error', title: 'Error', description: 'Failed to save snippet' });
    } finally {
      setIsSaving(false);
    }
  }

  const loadSnippet = (snippet: JwtSnippet) => {
    if (onLoadJwt) {
      onLoadJwt(snippet.jwt_token);
    }
    onClose();
  };

  async function deleteSnippet(snippetId: string) {
    try {
      const res = await fetch(`/api/jwt-snippets/${snippetId}`, { method: 'DELETE' });
      if (res.ok) {
        setSnippets(prev => prev.filter(s => s.id !== snippetId));
        toast({ type: 'success', title: 'Deleted', description: 'Snippet deleted.' });
      } else {
        const data = await res.json();
        toast({ type: 'error', title: 'Error', description: data.error || 'Failed to delete snippet' });
      }
    } catch (error) {
      toast({ type: 'error', title: 'Error', description: 'Failed to delete snippet' });
    }
  }

  async function toggleFavorite(snippetId: string) {
    try {
      const res = await fetch(`/api/jwt-snippets/${snippetId}`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok) {
        await loadSnippets();
      } else {
        toast({ type: 'error', title: 'Error', description: data.error || 'Failed to update favorite' });
      }
    } catch (error) {
      toast({ type: 'error', title: 'Error', description: 'Failed to update favorite' });
    }
  }

  function copySnippet(snippet: JwtSnippet) {
    navigator.clipboard.writeText(snippet.jwt_token);
    toast({ type: 'success', title: 'Copied', description: 'JWT copied to clipboard.' });
  }

  // Filtering is now handled by the backend; use 'snippets' directly

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              <CardTitle>JWT Snippets Manager</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Save, load, and manage your JWT tokens
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Save New Snippet */}
          {currentJwt && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-700 dark:text-green-400 text-base">
                  Save Current JWT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="snippet-name">Name *</Label>
                    <Input
                      id="snippet-name"
                      value={saveForm.name}
                      onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter snippet name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="snippet-tags">Tags</Label>
                    <Input
                      id="snippet-tags"
                      value={saveForm.tags}
                      onChange={(e) => setSaveForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="snippet-description">Description</Label>
                  <Input
                    id="snippet-description"
                    value={saveForm.description}
                    onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                  />
                </div>
                <Button
                  onClick={saveSnippet}
                  disabled={isSaving || !saveForm.name.trim()}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save JWT Snippet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search snippets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Favorites
            </Button>
          </div>

          {/* Snippets List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p>Loading snippets...</p>
              </div>
            ) : snippets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No snippets found</p>
                {searchTerm && <p className="text-sm">Try adjusting your search terms</p>}
              </div>
            ) : (
              snippets.map((snippet) => (
                <Card key={snippet.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{snippet.name}</h3>
                          {snippet.is_favorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                          {snippet.algorithm && (
                            <Badge variant="outline" className="text-xs">
                              {snippet.algorithm}
                            </Badge>
                          )}
                          {isExpired(snippet.expires_at) && (
                            <Badge variant="destructive" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>
                        
                        {snippet.description && (
                          <p className="text-sm text-muted-foreground mb-2">{snippet.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(snippet.created_at).toLocaleDateString()}
                          </div>
                          {snippet.tags && snippet.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {snippet.tags.join(', ')}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                          {snippet.jwt_token.substring(0, 50)}...
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadSnippet(snippet)}
                        >
                          <FolderOpen className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copySnippet(snippet)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFavorite(snippet.id)}
                        >
                          {snippet.is_favorite ? (
                            <Star className="w-4 h-4 fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSnippet(snippet.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium mb-1">JWT Snippets Tips:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Save frequently used JWTs for quick access</li>
                  <li>• Use tags to organize your snippets</li>
                  <li>• Mark important snippets as favorites</li>
                  <li>• Search by name, description, or tags</li>
                  <li>• Snippets are stored securely in your account</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 