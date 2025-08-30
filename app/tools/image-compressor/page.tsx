import { authServer } from '@/lib/auth';
import { getToolById } from '@/lib/tools';
import ImageCompressorClient from './components/image-compressor-client';
import { ToolPageHeader } from '@/components/shared/tool-page-header';
import { PremiumOverview } from '@/components/shared/premium-overview';

export default async function ImageCompressorPage() {
  const tool = getToolById('image-compressor');
  const user = await authServer.getUserProfile();
  const isBackerUser = user?.plan === 'backer';

  if (!tool) {
    return <div>Tool not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <ToolPageHeader icon={tool.icon} title={tool.name} description={tool.description} />

      {/* Main tool interface */}
      <ImageCompressorClient 
        isBackerUser={isBackerUser} 
        userId={user?.id}
      />

      {!isBackerUser && (
        <PremiumOverview 
          features={tool.features.backer ?? []}
          title="Backer Features"
          subtitle="Get access to advanced image compression capabilities"
        />
      )}
    </div>
  );
} 