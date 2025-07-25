import React from "react";
import { getToolById } from "@/lib/tools";
import { authServer } from "@/lib/auth";
import { Shield, Crown, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import JwtDecoderClient from "./components/jwt-decoder-client";
import { Button } from "@/components/ui/button";

export default async function JwtDecoderPage() {
  const tool = getToolById('jwt-decoder');
  const user = await authServer.getUserProfile();
  const isPremiumUser = user?.plan === 'premium';
  
  if (!tool) {
    return <div>Tool not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {tool.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tool.description}
          </p>
        </div>
      </div>
      
      {/* Main tool UI */}
      <JwtDecoderClient isPremiumUser={isPremiumUser} userId={user?.id} />

      {/* Feature Overview - Only show for free users */}
      {!isPremiumUser && (
        <div className="mt-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mb-3">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Unlock Premium Features
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Enhance your JWT workflow with powerful premium tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Features */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400 text-base">
                  <CheckCircle className="w-4 h-4" />
                  What You Get Now
                </CardTitle>
                <CardDescription className="text-xs">
                  Your current free plan includes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1.5 text-xs">
                  {tool.features.free.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Premium Features */}
            <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-base">
                  <Crown className="w-4 h-4" />
                  Premium Upgrade
                </CardTitle>
                <CardDescription className="text-xs">
                  Unlock these powerful features
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <ul className="space-y-1.5 text-xs">
                  {tool.features.premium?.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="pt-2">
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 