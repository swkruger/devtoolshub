import { getToolById } from '@/lib/tools';
import { authServer } from '@/lib/auth';
import { Hash, Crown, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ToolPageHeader } from '@/components/shared/tool-page-header';
import { PremiumOverview } from '@/components/shared/premium-overview';
import UuidGeneratorClient from './components/uuid-generator-client';

export default async function UuidGeneratorPage() {
  const tool = getToolById('uuid-generator');
  const userProfile = await authServer.getUserProfile();
  const isBackerUser = userProfile?.plan === 'backer';
  const userId = userProfile?.id;

  if (!tool) {
    return <div>Tool not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <ToolPageHeader icon={tool.icon} title={tool.name} description={tool.description} />

      {/* Main tool component */}
      <UuidGeneratorClient isBackerUser={isBackerUser} userId={userId} />

      {!isBackerUser && (
        <PremiumOverview 
          features={tool.features.backer ?? []}
          title="Backer Features"
          subtitle="Unlock advanced UUID generation capabilities"
        />
      )}
    </div>
  );
} 