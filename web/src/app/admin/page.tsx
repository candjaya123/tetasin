import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Store,
  HandCoins,
  TrendingUp,
  ArrowUpRight,
  Activity,
} from "lucide-react";

export default function AdminOverview() {
  const stats = [
    { title: "Total Tenant", value: "1,284", change: "+42", icon: <Store className="w-5 h-5 text-primary" /> },
    { title: "Pengguna Aktif", value: "48,502", change: "+1,204", icon: <Users className="w-5 h-5 text-blue-500" /> },
    { title: "Total Transaksi", value: "Rp 1.4B", change: "+18%", icon: <HandCoins className="w-5 h-5 text-amber-500" /> },
    { title: "Uptime Sistem", value: "99.98%", change: "Stable", icon: <Activity className="w-5 h-5 text-purple-500" /> },
  ];

  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">Platform Overview</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Pantau performa seluruh ekosistem Tetasin secara real-time.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/60 backdrop-blur-sm border border-border/40 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium text-muted-foreground shadow-sm">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400" />
            <span>Live Feed</span>
          </div>
        </div>
      </div>

      {/* Stats — 2 columns on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {stats.map((stat, i) => (
          <Card key={i} variant="elevated" className="card-lift">
            <CardHeader className="pb-1 space-y-0 flex flex-row items-center justify-between p-3 sm:p-5">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-muted/50 transition-colors">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-5 pb-3 sm:pb-5">
              <div className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center mt-1 sm:mt-1.5 text-[10px] sm:text-xs font-semibold text-primary">
                <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                <span>{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card variant="elevated" className="lg:col-span-2 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-semibold text-foreground">Statistik Pertumbuhan Platform</h3>
            <div className="flex gap-1 p-0.5 bg-muted/50 rounded-xl">
              {['7D', '30D', '90D'].map(t => (
                <button
                  key={t}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                    t === '30D'
                      ? 'bg-white text-foreground shadow-sm border border-border/30'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[240px] sm:h-[300px] w-full bg-muted/30 rounded-2xl border border-dashed border-border/40 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-muted-foreground/15" />
              <p className="text-xs sm:text-sm text-muted-foreground/40 font-medium">Grafik akan dimuat di sini</p>
            </div>
          </div>
        </Card>

        {/* Top Tenants */}
        <Card variant="elevated" className="overflow-hidden">
          <CardHeader className="bg-secondary text-secondary-foreground p-4 sm:p-5">
            <CardTitle className="text-xs sm:text-sm font-semibold text-primary/60 uppercase tracking-wider">
              Top Performing Tenants
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { name: "Coffee Shop A", revenue: "Rp 150M", growth: "+12%" },
              { name: "Fashion Store B", revenue: "Rp 120M", growth: "+8%" },
              { name: "Gadget Hub", revenue: "Rp 95M", growth: "+15%" },
              { name: "Bakery & Co", revenue: "Rp 88M", growth: "+5%" },
              { name: "Auto Clean", revenue: "Rp 72M", growth: "+20%" },
            ].map((tenant, i) => (
              <div key={i} className="flex items-center justify-between p-3 sm:p-4 border-b border-border/20 hover:bg-muted/20 transition-colors">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{tenant.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Premium Subscription</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs sm:text-sm font-semibold text-foreground">{tenant.revenue}</p>
                  <p className="text-[10px] sm:text-xs font-semibold text-primary">{tenant.growth}</p>
                </div>
              </div>
            ))}
            <div className="p-3 sm:p-4">
              <button className="w-full py-2 sm:py-2.5 rounded-xl bg-muted/50 text-muted-foreground text-[10px] sm:text-xs font-medium hover:bg-muted hover:text-foreground transition-colors">
                Lihat Semua Tenant
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
