"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  HandCoins,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutGrid },
    { name: 'Semua Tenant', href: '/admin/tenants', icon: Users },
    { name: 'Persetujuan Payout', href: '/admin/approvals', icon: HandCoins },
    { name: 'Pengaturan Platform', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 sm:w-72 bg-secondary text-secondary-foreground
        transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0
        flex flex-col
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="p-6 sm:p-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg sm:text-xl shadow-md shadow-primary/25">
              T
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold block text-white tracking-tight">Tetasin</span>
              <span className="text-[10px] sm:text-[11px] text-primary/60 uppercase tracking-widest font-semibold">Super Admin</span>
            </div>
          </div>
          <button className="lg:hidden p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/5 transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-grow px-3 sm:px-4 space-y-0.5 sm:space-y-1">
          <div className="text-[10px] sm:text-[11px] uppercase text-white/25 font-semibold px-3 sm:px-4 mb-2 sm:mb-3 tracking-wider">
            Main Navigation
          </div>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-xl text-[13px] sm:text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? '' : 'opacity-60'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 sm:p-4">
          <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary/60" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-white truncate">Admin Tetasin</p>
                <p className="text-[10px] sm:text-xs text-white/30 truncate">admin@tetasin.com</p>
              </div>
            </div>
            <Button
              variant="destructive"
              className="w-full justify-start gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border-none h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-medium"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-grow flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-14 sm:h-16 bg-white/70 backdrop-blur-2xl border-b border-border/40 flex items-center justify-between px-3 sm:px-8 z-30 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button className="lg:hidden p-2 hover:bg-muted rounded-xl transition-colors shrink-0" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-semibold text-foreground tracking-tight truncate">
                {menuItems.find(i => i.href === pathname)?.name || 'Admin Panel'}
              </h2>
              <p className="hidden sm:block text-xs text-muted-foreground">Ekosistem Manajemen Tetasin</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700">System Online</span>
            </div>

            <ThemeToggle position="inline" className="border-none bg-transparent hover:bg-muted/60 shadow-none !p-2 text-muted-foreground/60 hover:text-foreground" />

            <button className="relative p-2 text-muted-foreground/60 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-grow overflow-y-auto p-3 sm:p-6 md:p-8 bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
