'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  X, 
  Plus, 
  Trash2, 
  Copy, 
  Database,
  AlertCircle,
  Check,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface NamespaceManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Namespace {
  id: string;
  name: string;
  uuid: string;
  description: string;
  isDefault: boolean;
  createdAt: Date;
}

const DEFAULT_NAMESPACES: Namespace[] = [
  {
    id: 'dns',
    name: 'DNS',
    uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    description: 'DNS namespace for UUID v3/v5',
    isDefault: true,
    createdAt: new Date()
  },
  {
    id: 'url',
    name: 'URL',
    uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    description: 'URL namespace for UUID v3/v5',
    isDefault: true,
    createdAt: new Date()
  },
  {
    id: 'oid',
    name: 'OID',
    uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    description: 'OID namespace for UUID v3/v5',
    isDefault: true,
    createdAt: new Date()
  },
  {
    id: 'x500',
    name: 'X.500 DN',
    uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    description: 'X.500 DN namespace for UUID v3/v5',
    isDefault: true,
    createdAt: new Date()
  }
];

export default function NamespaceManager({ isOpen, onClose }: NamespaceManagerProps) {

  const [namespaces, setNamespaces] = useState<Namespace[]>(DEFAULT_NAMESPACES);
  const [isAdding, setIsAdding] = useState(false);
  const [newNamespace, setNewNamespace] = useState({
    name: '',
    uuid: '',
    description: ''
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateUuid = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const validateInputs = (): string[] => {
    const errors: string[] = [];
    
    if (!newNamespace.name.trim()) {
      errors.push('Namespace name is required');
    }
    
    if (!newNamespace.uuid.trim()) {
      errors.push('Namespace UUID is required');
    } else if (!validateUuid(newNamespace.uuid)) {
      errors.push('Invalid UUID format');
    }
    
    if (!newNamespace.description.trim()) {
      errors.push('Description is required');
    }
    
    // Check for duplicate names
    if (namespaces.some(ns => ns.name.toLowerCase() === newNamespace.name.toLowerCase())) {
      errors.push('Namespace name already exists');
    }
    
    return errors;
  };

  const handleAddNamespace = () => {
    const errors = validateInputs();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    const namespace: Namespace = {
      id: Date.now().toString(),
      name: newNamespace.name.trim(),
      uuid: newNamespace.uuid.trim(),
      description: newNamespace.description.trim(),
      isDefault: false,
      createdAt: new Date()
    };

    setNamespaces(prev => [...prev, namespace]);
    setNewNamespace({ name: '', uuid: '', description: '' });
    setIsAdding(false);
    setValidationErrors([]);

    toast.success('Namespace Added', {
      description: `Namespace "${namespace.name}" added successfully`
    });
  };

  const handleDeleteNamespace = (id: string) => {
    const namespace = namespaces.find(ns => ns.id === id);
    if (namespace?.isDefault) {
      toast.error('Cannot Delete', {
        description: 'Default namespaces cannot be deleted'
      });
      return;
    }

    setNamespaces(prev => prev.filter(ns => ns.id !== id));
    toast.success('Namespace Deleted', {
      description: `Namespace "${namespace?.name}" deleted successfully`
    });
  };

  const copyNamespaceUuid = async (uuid: string) => {
    try {
      await navigator.clipboard.writeText(uuid);
      toast.success('Copied to Clipboard', {
        description: 'Namespace UUID copied successfully'
      });
    } catch (error) {
      toast.error('Copy Failed', {
        description: 'Failed to copy UUID to clipboard'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Namespace Manager
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close namespace manager"
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

        {/* Add New Namespace */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add New Namespace</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {isAdding ? 'Cancel' : 'Add Namespace'}
              </Button>
            </CardTitle>
          </CardHeader>
          {isAdding && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="namespace-name">Name</Label>
                  <Input
                    id="namespace-name"
                    value={newNamespace.name}
                    onChange={(e) => setNewNamespace(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Custom Namespace"
                  />
                </div>
                <div>
                  <Label htmlFor="namespace-uuid">UUID</Label>
                  <Input
                    id="namespace-uuid"
                    value={newNamespace.uuid}
                    onChange={(e) => setNewNamespace(prev => ({ ...prev, uuid: e.target.value }))}
                    placeholder="6ba7b810-9dad-11d1-80b4-00c04fd430c8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="namespace-description">Description</Label>
                <Input
                  id="namespace-description"
                  value={newNamespace.description}
                  onChange={(e) => setNewNamespace(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description of this namespace"
                />
              </div>
              <Button onClick={handleAddNamespace} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Namespace
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Namespaces List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Namespaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {namespaces.map((namespace) => (
                <div key={namespace.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {namespace.name}
                      </span>
                      {namespace.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {namespace.description}
                    </p>
                    <div className="font-mono text-xs text-gray-500 dark:text-gray-500">
                      {namespace.uuid}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyNamespaceUuid(namespace.uuid)}
                      aria-label="Copy namespace UUID"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {!namespace.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNamespace(namespace.id)}
                        aria-label="Delete namespace"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} aria-label="Close namespace manager">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 