'use client';

import React from 'react';
import { Zap, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BlurredInsightProps {
  title: string;
  content: string; // Changed from teaserText/lockedText
}

export const BlurredInsight: React.FC<BlurredInsightProps> = ({
  title,
  content,
}) => {
  return (
    <Card className="relative overflow-hidden border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
        <Sparkles className="w-12 h-12 text-primary" />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-primary/20 rounded-lg text-primary">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className="font-black text-primary text-xs uppercase tracking-[0.2em]">{title}</h4>
        </div>
        
        <p className="text-slate-700 font-bold leading-relaxed">
          {content}
        </p>
      </CardContent>
    </Card>
  );
};
