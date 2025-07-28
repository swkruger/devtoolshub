import { authServer } from '@/lib/auth';
import { getToolById } from '@/lib/tools';
import ImageCompressorClient from './components/image-compressor-client';

export default async function ImageCompressorPage() {
  const tool = getToolById('image-compressor');
  const user = await authServer.getUserProfile();
  const isPremiumUser = user?.plan === 'premium';

  if (!tool) {
    return <div>Tool not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {/* Compact header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
          <tool.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {tool.name}
          </h1>
        </div>
      </div>

      {/* Main tool interface */}
      <ImageCompressorClient 
        isPremiumUser={isPremiumUser} 
        userId={user?.id}
      />

      {/* Premium feature overview for free users */}
      {!isPremiumUser && (
        <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20">
              <tool.icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Unlock Premium Features
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get access to advanced image compression capabilities
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                🚀 Batch Processing
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Compress multiple images at once with progress tracking and bulk download
              </p>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                🎨 Format Conversion
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Convert to modern formats like WebP and AVIF for better compression
              </p>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                ⚙️ Advanced Controls
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Resize, strip metadata, and fine-tune compression settings
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 