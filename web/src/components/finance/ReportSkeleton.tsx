import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const ReportSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-10 w-48 bg-slate-200 rounded-xl" />
        <div className="h-4 w-64 bg-slate-100 rounded-lg" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-sm bg-slate-50">
            <CardContent className="p-6 space-y-3">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-8 w-32 bg-slate-200 rounded-lg" />
              <div className="h-3 w-24 bg-slate-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50 border-b h-14" />
          <CardContent className="p-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between p-4 border-b border-slate-50">
                <div className="space-y-2">
                  <div className="h-2 w-12 bg-slate-100 rounded" />
                  <div className="h-4 w-32 bg-slate-100 rounded" />
                </div>
                <div className="h-5 w-24 bg-slate-100 rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-white overflow-hidden h-[300px]">
            <CardHeader className="bg-slate-50 border-b h-14" />
            <CardContent className="p-4" />
          </Card>
          <Card className="border-none shadow-sm bg-white overflow-hidden h-[200px]">
             <CardHeader className="bg-slate-50 border-b h-14" />
             <CardContent className="p-4" />
          </Card>
        </div>
      </div>
    </div>
  );
};
