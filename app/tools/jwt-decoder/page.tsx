import React from "react";
import { getToolById } from "@/lib/tools";
import { authServer } from "@/lib/auth";
import { Shield, Crown, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import JwtDecoderClient from "./components/jwt-decoder-client";
import { Button } from "@/components/ui/button";
import { ToolPageHeader } from "@/components/shared/tool-page-header";
import { PremiumOverview } from "@/components/shared/premium-overview";

export default async function JwtDecoderPage() {
  const tool = getToolById('jwt-decoder');
  const user = await authServer.getUserProfile();
  const isBackerUser = user?.plan === 'backer';
  
  if (!tool) {
    return <div>Tool not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <ToolPageHeader icon={tool.icon} title={tool.name} description={tool.description} />
      
      {/* Main tool UI */}
              <JwtDecoderClient isBackerUser={isBackerUser} userId={user?.id} />
        
        {!isBackerUser && (
          <PremiumOverview
            features={tool.features.backer ?? []}
            title="Backer Features"
            subtitle="Enhance your JWT workflow with powerful backer tools"
          />
        )}
    </div>
  );
} 