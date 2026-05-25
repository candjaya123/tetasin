"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  Settings,
  LogOut,
  ShoppingBag,
  Package,
  FileText,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  X,
  Bell,
  User,
  Crown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { profileService } from '@/lib/api/profileService';
import { useTheme } from '@/components/shared/ThemeProvider';
import { ChatWidget } from '@/components/ai/ChatWidget';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        if (session?.user?.email) {
          setUserEmail(session.user.email);
        }

        const [tenantData, profileData] = await Promise.all([
          profileService.getTenant(),
          profileService.getProfile()
        ]);

        setTenant(tenantData);

        const { data: industryProfile } = await supabase
          .from('tenant_industry_profiles')
          .select('id')
          .eq('tenant_id', tenantData.id)
          .maybeSingle();

        if (!industryProfile && pathname !== '/tenant/onboarding') {
          router.push('/tenant/onboarding');
        }

      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchTenant();
  }, [router, supabase.auth, pathname]);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!tenant?.id) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/v1/business-profile/alerts/count`, {
          headers: await (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            return { 'Authorization': `Bearer ${session?.access_token}` };
          })(),
        });
        if (res.ok) {
          const { count } = await res.json();
          setUnreadCount(count || 0);
        }
      } catch {}
    };
    fetchUnread();

    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [tenant?.id]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 rounded-lg bg-primary/30" />
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  const isPersonal = tenant?.account_type === 'personal';

  const menuItems = isPersonal ? [
    { name: 'Dashboard', href: '/tenant', icon: LayoutDashboard, show: true },
    { name: 'Keuangan Pribadi', href: '/tenant/personal', icon: Wallet, show: true },
    { name: 'Pemasukan', href: '/tenant/income', icon: ArrowUpRight, show: true },
    { name: 'Pengeluaran', href: '/tenant/expense', icon: ArrowDownRight, show: true },
    { name: 'Transfer', href: '/tenant/personal/transfer', icon: ArrowUpRight, show: true },
    { name: 'Anggaran', href: '/tenant/personal/budgets', icon: Wallet, show: true },
    { name: 'Tujuan', href: '/tenant/personal/goals', icon: Crown, show: true },
    { name: 'Berulang', href: '/tenant/personal/recurring', icon: History, show: true },
    { name: 'Laporan', href: '/tenant/transactions', icon: FileText, show: true },
    { name: 'Notifikasi', href: '/tenant/notifications', icon: Bell, show: true },
    { name: 'Pengaturan', href: '/tenant/settings', icon: Settings, show: true },
  ] : [
    { name: 'Dashboard', href: '/tenant', icon: LayoutDashboard, show: true },
    { name: 'Kasir POS', href: '/tenant/pos', icon: ShoppingBag, show: true },
    { name: 'Produk & Stok', href: '/tenant/inventory', icon: Package, show: true },
    { name: 'Pesanan', href: '/tenant/orders', icon: FileText, show: true },
    { name: 'Manajemen Staf', href: '/tenant/staff', icon: User, show: true },
    { name: 'Laporan Keuangan', href: '/tenant/finance', icon: FileText, show: true },
    { name: 'Anggaran', href: '/tenant/budget', icon: Wallet, show: true },
    { name: 'AI Chat', href: '/tenant/ai-chat', icon: Sparkles, show: true },
    { name: 'Transaksi', href: '/tenant/transactions', icon: History, show: true },
    { name: 'Penarikan Dana', href: '/tenant/withdrawal', icon: Wallet, show: true },
    { name: 'Notifikasi', href: '/tenant/notifications', icon: Bell, show: true },
    { name: 'Pengaturan', href: '/tenant/settings', icon: Settings, show: true },
  ].filter(item => item.show);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const currentPageTitle = menuItems.find(item => item.href === pathname)?.name || 'Tetasin';

  if (pathname === '/tenant/onboarding') {
    return (
      <div className="min-h-screen bg-background font-sans relative">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ================================================
          SIDEBAR — Glass premium sidebar (light + dark)
          ================================================ */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        bg-card/80 backdrop-blur-2xl border-r border-border/40
        transform transition-all duration-300 ease-out lg:relative lg:translate-x-0
        flex flex-col
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        ${isCollapsed ? 'w-[72px]' : 'w-60 sm:w-72'}
      `}>
        {/* Logo */}
        <div className={`px-4 sm:px-5 py-5 sm:py-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} relative`}>
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden">
            <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg sm:text-xl shadow-md shadow-primary/20">
              T
            </div>
            {!isCollapsed && (
              <span className="text-lg sm:text-xl font-bold text-foreground tracking-tight whitespace-nowrap">
                Tetasin
              </span>
            )}
          </div>

          {!isCollapsed && (
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-xl transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}

          {/* Collapse toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-card border border-border/60 rounded-full items-center justify-center shadow-sm hover:bg-muted hover:border-primary/30 transition-all z-50"
          >
            {isCollapsed
              ? <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              : <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            }
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow px-2.5 sm:px-3 space-y-0.5 sm:space-y-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : ""}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-xl text-[13px] sm:text-sm font-medium transition-all duration-200 group
                  ${isCollapsed ? 'justify-center' : ''}
                  ${isActive
                    ? 'bg-primary/10 text-foreground shadow-sm border border-primary/15'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground/60 group-hover:text-primary'}`} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 sm:p-4 border-t border-border/40">
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Keluar" : ""}
            className={`
              flex items-center gap-3 px-3 sm:px-4 py-2.5 w-full rounded-xl text-[13px] sm:text-sm font-medium
              text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ================================================
          MAIN CONTENT
          ================================================ */}
      <div className="flex-grow flex flex-col overflow-hidden relative">

        {/* HEADER — Glass, compact on mobile */}
        <header className="h-14 sm:h-16 md:h-18 bg-card/70 backdrop-blur-2xl border-b border-border/40 flex items-center justify-between px-3 sm:px-6 md:px-8 z-30 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-xl transition-colors shrink-0"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-sm sm:text-lg font-semibold text-foreground tracking-tight truncate">
              {currentPageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

            {/* ---- THEME TOGGLE BUTTON ---- */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
              className="relative p-2 rounded-xl transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-muted/60 group"
              aria-label="Toggle theme"
            >
              <Sun
                className={`w-4.5 h-4.5 sm:w-5 sm:h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
                }`}
              />
              <Moon
                className={`w-4.5 h-4.5 sm:w-5 sm:h-5 transition-all duration-300 ${
                  theme === 'dark' ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                }`}
              />
            </button>

            {/* Notifications */}
            <button
              onClick={() => router.push('/tenant/notifications')}
              className="relative p-2 text-muted-foreground/60 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-500 rounded-full border-2 border-card text-[8px] sm:text-[9px] text-white flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border/40 overflow-hidden hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group shadow-sm shrink-0 focus:outline-none"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-primary transition-colors" />
              </button>

              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-card/95 backdrop-blur-xl rounded-2xl border border-border/40 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header User Info */}
                    <div className="px-4 py-3 border-b border-border/40">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Akun Anda</p>
                      <p className="text-sm font-bold text-foreground truncate">{tenant?.name || 'Partner Tetasin'}</p>
                      {userEmail && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{userEmail}</p>
                      )}
                      {tenant?.subscription_tier && (
                        <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                          <Crown className="w-3 h-3" />
                          {tenant.subscription_tier}
                        </div>
                      )}
                    </div>

                    {/* Theme toggle inside dropdown */}
                    <div className="px-2 pt-2 pb-1">
                      <button
                        onClick={() => { toggleTheme(); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs sm:text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {theme === 'dark'
                          ? <Sun className="w-4 h-4 text-amber-400" />
                          : <Moon className="w-4 h-4 text-muted-foreground" />
                        }
                        {theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
                      </button>
                    </div>

                    {/* Dropdown Items */}
                    <div className="p-1.5 space-y-0.5">
                      <Link href="/tenant/settings">
                        <button
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs sm:text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Pengaturan Tenant
                        </button>
                      </Link>

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs sm:text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-grow overflow-y-auto p-3 sm:p-6 md:p-10 bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <ChatWidget />
      </div>
    </div>
  );
}
