'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Copy, 
  Trash2, 
  History,
  AlertCircle,
  Search,
  Filter,
  Download,
  Loader2,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface UuidHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HistoryEntry {
  id: string;
  uuid: string;
  version: string;
  format: string;
  namespace?: string;
  name?: string;
  timestamp: Date;
  isFavorite: boolean;
}

// Mock data for demonstration
const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: '1',
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    version: 'v4',
    format: 'standard',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isFavorite: false
  },
  {
    id: '2',
    uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    version: 'v1',
    format: 'standard',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    isFavorite: true
  },
  {
    id: '3',
    uuid: 'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e5e6',
    version: 'v3',
    format: 'compact',
    namespace: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    name: 'example',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isFavorite: false
  }
];

export default function UuidHistory({ isOpen, onClose }: UuidHistoryProps) {

  const [history, setHistory] = useState<HistoryEntry[]>(MOCK_HISTORY);
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>(MOCK_HISTORY);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter history based on search and filters
  useEffect(() => {
    let filtered = history;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.format.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.name && entry.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Version filter
    if (selectedVersion !== 'all') {
      filtered = filtered.filter(entry => entry.version === selectedVersion);
    }

    // Format filter
    if (selectedFormat !== 'all') {
      filtered = filtered.filter(entry => entry.format === selectedFormat);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(entry => entry.isFavorite);
    }

    setFilteredHistory(filtered);
  }, [history, searchTerm, selectedVersion, selectedFormat, showFavoritesOnly]);

  const copyUuid = async (uuid: string) => {
    try {
      await navigator.clipboard.writeText(uuid);
      toast.success('Copied to Clipboard', {
        description: 'UUID copied successfully'
      });
    } catch (error) {
      toast.error('Copy Failed', {
        description: 'Failed to copy UUID to clipboard'
      });
    }
  };

  const toggleFavorite = (id: string) => {
    setHistory(prev => prev.map(entry => 
      entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry
    ));
  };

  const deleteEntry = (id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
    toast.success('Entry Deleted', {
      description: 'History entry deleted successfully'
    });
  };

  const downloadHistory = (format: 'json' | 'csv' | 'txt') => {
    const data = filteredHistory.map(entry => ({
      uuid: entry.uuid,
      version: entry.version,
      format: entry.format,
      namespace: entry.namespace,
      name: entry.name,
      timestamp: entry.timestamp.toISOString(),
      isFavorite: entry.isFavorite
    }));

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = `uuid-history-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = 'UUID,Version,Format,Namespace,Name,Timestamp,IsFavorite\n' +
          data.map(row => `"${row.uuid}","${row.version}","${row.format}","${row.namespace || ''}","${row.name || ''}","${row.timestamp}","${row.isFavorite}"`).join('\n');
        filename = `uuid-history-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      case 'txt':
        content = data.map(row => `${row.uuid} (${row.version}, ${row.format})`).join('\n');
        filename = `uuid-history-${Date.now()}.txt`;
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
      description: `History downloaded as ${filename}`
    });
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success('History Cleared', {
      description: 'All history entries have been cleared'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              UUID History
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close history"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search UUIDs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="version-filter">Version</Label>
                <select
                  id="version-filter"
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Versions</option>
                  <option value="v1">V1</option>
                  <option value="v3">V3</option>
                  <option value="v4">V4</option>
                  <option value="v5">V5</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="format-filter">Format</Label>
                <select
                  id="format-filter"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Formats</option>
                  <option value="standard">Standard</option>
                  <option value="compact">Compact</option>
                  <option value="base64">Base64</option>
                  <option value="binary">Binary</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  id="favorites-only"
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="favorites-only">Favorites Only</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredHistory.length} of {history.length} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadHistory('json')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadHistory('csv')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadHistory('txt')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              TXT
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="flex items-center gap-2 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        </div>

        {/* History List */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading history...</span>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  No history entries found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Your generated UUIDs will appear here
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm break-all">{entry.uuid}</span>
                        {entry.isFavorite && (
                          <Badge variant="secondary" className="text-xs">
                            Favorite
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span>{entry.version.toUpperCase()}</span>
                        <span>{entry.format}</span>
                        {entry.namespace && <span>NS: {entry.namespace.slice(0, 8)}...</span>}
                        {entry.name && <span>Name: {entry.name}</span>}
                        <span>{entry.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyUuid(entry.uuid)}
                        aria-label="Copy UUID"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(entry.id)}
                        aria-label={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        className={entry.isFavorite ? 'text-yellow-500' : 'text-gray-400'}
                      >
                        <Star className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEntry(entry.id)}
                        aria-label="Delete entry"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} aria-label="Close history">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 