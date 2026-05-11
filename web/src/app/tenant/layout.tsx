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
  Crown
} from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { profileService } from '@/lib/api/profileService';

import { ChatWidget } from '@/components/ai/ChatWidget';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        
        const [tenantData, profileData] = await Promise.all([
          profileService.getTenant(),
          profileService.getProfile()
        ]);
        
        setTenant(tenantData);

        // Enforce onboarding
        if (profileData && !profileData.industry && pathname !== '/tenant/onboarding') {
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

  // Route Guard for Personal vs Business
  useEffect(() => {
    if (!loading && tenant) {
      const isPersonal = tenant.account_type === 'personal';
      const businessRoutes = [
        '/tenant/pos', 
        '/tenant/inventory', 
        '/tenant/staff', 
        '/tenant/drafts', 
        '/tenant/finance'
      ];
      
      if (isPersonal && businessRoutes.some(route => pathname.startsWith(route))) {
        router.push('/tenant');
      }
    }
  }, [pathname, tenant, loading, router]);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!tenant?.id) return;
      const { count } = await supabase
        .from('smart_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };
    fetchUnread();
    
    // Simple polling
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [tenant?.id, supabase]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isPersonal = tenant?.account_type === 'personal';

  const menuItems = isPersonal ? [
    { name: 'Dashboard', href: '/tenant', icon: LayoutDashboard, show: true },
    { name: 'Pemasukan', href: '/tenant/income', icon: ArrowUpRight, show: true },
    { name: 'Pengeluaran', href: '/tenant/expense', icon: ArrowDownRight, show: true },
    { name: 'Anggaran', href: '/tenant/budget', icon: Wallet, show: true },
    { name: 'Laporan', href: '/tenant/transactions', icon: FileText, show: true },
    { name: 'Pengaturan', href: '/tenant/settings', icon: Settings, show: true },
  ] : [
    { name: 'Dashboard', href: '/tenant', icon: LayoutDashboard, show: true },
    { name: 'Kasir POS', href: '/tenant/pos', icon: ShoppingBag, show: true },
    { name: 'Produk & Stok', href: '/tenant/inventory', icon: Package, show: true },
    { name: 'Manajemen Staf', href: '/tenant/staff', icon: User, show: true },
    { name: 'Validasi Transaksi AI', href: '/tenant/drafts', icon: FileText, show: true },
    { name: 'Laporan Keuangan', href: '/tenant/finance', icon: FileText, show: true },
    { name: 'Transaksi', href: '/tenant/transactions', icon: History, show: true },
    { name: 'Penarikan Dana', href: '/tenant/withdrawal', icon: Wallet, show: true },
    { name: 'Pengaturan', href: '/tenant/settings', icon: Settings, show: true },
  ].filter(item => item.show);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const currentPageTitle = menuItems.find(item => item.href === pathname)?.name || 'Tumbuhin';

  if (pathname === '/tenant/onboarding') {
    return (
      <div className="min-h-screen bg-background font-sans">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-secondary/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white border-r border-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 sm:p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-lg sm:text-xl shadow-lg shadow-primary/20">T</div>
              <span className="text-xl sm:text-2xl font-black text-secondary tracking-tight">Tumbuhin</span>
            </div>
            <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <nav className="flex-grow px-6 space-y-1.5 overflow-y-auto pb-8">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`
                    flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                      : 'text-muted-foreground hover:bg-slate-50 hover:text-secondary'}
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-slate-400 group-hover:text-primary'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t border-border">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-5 py-3.5 w-full rounded-2xl text-sm font-bold text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-border flex items-center justify-between px-4 sm:px-8 z-30">
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <h1 className="text-lg md:text-xl font-black text-secondary truncate max-w-[180px] sm:max-w-none">
              {currentPageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button 
              onClick={() => router.push('/tenant/settings')} 
              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white text-[9px] text-white flex items-center justify-center font-black">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-secondary border border-border overflow-hidden hover:border-primary transition-colors cursor-pointer group">
              <User className="w-5 h-5 group-hover:text-primary transition-colors" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow overflow-y-auto p-4 sm:p-8 md:p-12 bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <ChatWidget />
      </div>
    </div>
  );
}
