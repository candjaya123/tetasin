'use client';

import React from 'react';
import { Zap, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BlurredInsightProps {
  title: string;
  content: string;
}

export const BlurredInsight: React.FC<BlurredInsightProps> = ({
  title,
  content,
}) => {
  return (
    <Card variant="glass" className="relative overflow-hidden border-primary/15 bg-primary/3 hover:bg-primary/6 transition-all duration-300 card-lift">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:opacity-10 transition-opacity">
        <Sparkles className="w-14 h-14 text-primary" />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-primary/15 rounded-lg text-primary">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-primary uppercase tracking-widest">{title}</h4>
        </div>

        <p className="text-foreground/80 leading-relaxed">
          {content}
        </p>
      </CardContent>
    </Card>
  );
};
