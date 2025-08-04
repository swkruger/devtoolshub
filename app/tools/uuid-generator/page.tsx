import { getToolById } from '@/lib/tools';
import { authServer } from '@/lib/auth';
import { Hash, Crown, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import UuidGeneratorClient from './components/uuid-generator-client';

export default async function UuidGeneratorPage() {
  const tool = getToolById('uuid-generator');
  const userProfile = await authServer.getUserProfile();
  const isPremiumUser = userProfile?.plan === 'premium';
  const userId = userProfile?.id;

  if (!tool) {
    return <div>Tool not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {/* Compact header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
          <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {tool.name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Main tool component */}
      <UuidGeneratorClient isPremiumUser={isPremiumUser} userId={userId} />

      {/* Premium Feature Overview for Free Users */}
      {!isPremiumUser && (
        <div className="mt-8">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Premium Features Available
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tool.features.premium?.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 