'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { profileService } from '@/lib/api/profileService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Loader2, Settings, Trash2, Crown, Save, Bell, User } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [profile, setProfile] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotif, setSavingNotif] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '' });

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileData, tenantData] = await Promise.all([
        profileService.getProfile(),
        profileService.getTenant(),
      ]);
      setProfile(profileData);
      setTenant(tenantData);
      setProfileForm({
        full_name: profileData?.full_name || '',
        email: profileData?.email || '',
      });

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/v1/business-profile/notifications`,
          { headers: { 'Authorization': `Bearer ${session.access_token}` } }
        );
        if (res.ok) {
          const notifData = await res.json();
          let dataArray: any[] = [];
          if (Array.isArray(notifData)) {
            dataArray = notifData;
          } else if (notifData && Array.isArray(notifData.data)) {
            dataArray = notifData.data;
          } else if (notifData && notifData.data) {
            dataArray = [notifData.data];
          }
          setNotifications(dataArray);
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await profileService.updateProfile({ full_name: profileForm.full_name });
      toast({ title: 'Berhasil', description: 'Profil berhasil diperbarui' });
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.message || 'Gagal memperbarui profil', variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleNotification = async (role: string, enabled: boolean) => {
    setSavingNotif(role);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/v1/business-profile/notifications/${role}`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: enabled }),
        }
      );
      setNotifications(prev => prev.map(n => n.role === role ? { ...n, is_active: enabled } : n));
      toast({ title: 'Berhasil', description: `Notifikasi untuk ${role} diperbarui` });
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.message || 'Gagal memperbarui notifikasi', variant: 'destructive' });
    } finally {
      setSavingNotif(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'HAPUS') {
      toast({ variant: 'destructive', title: 'Konfirmasi Gagal', description: 'Silakan ketik HAPUS untuk mengonfirmasi.' });
      return;
    }
    setIsDeleting(true);
    try {
      await profileService.deleteAccount();
      await supabase.auth.signOut();
      toast({ title: 'Akun Dihapus', description: 'Semua data bisnis Anda telah berhasil dihapus.' });
      router.push('/login');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Gagal Menghapus Akun', description: error.message || 'Terjadi kesalahan sistem' });
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8 pb-8 sm:pb-10">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <h1 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">Pengaturan</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Profile */}
        <Card variant="elevated" className="rounded-3xl">
          <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">Profil</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Informasi akun pribadi Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nama Lengkap
              </Label>
              <Input
                id="full_name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                className="h-11 sm:h-12 rounded-xl border-border/50 text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                value={profileForm.email}
                disabled
                className="h-11 sm:h-12 bg-muted/60 rounded-xl border-border/50 text-sm font-medium text-muted-foreground"
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="w-full h-11 sm:h-12 rounded-xl text-sm font-medium"
            >
              {savingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Profil
            </Button>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card variant="elevated" className="rounded-3xl">
          <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">Langganan</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Status dan paket akun bisnis Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-xl">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Paket Saat Ini</span>
              <span className="text-xs sm:text-sm font-semibold text-primary uppercase">{tenant?.subscription_tier || 'FREE'}</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-xl">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Tipe Akun</span>
              <span className="text-xs sm:text-sm font-semibold text-foreground capitalize">{tenant?.account_type || 'business'}</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-xl">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Nama Bisnis</span>
              <span className="text-xs sm:text-sm font-semibold text-foreground">{tenant?.name || '-'}</span>
            </div>
            <Button
              onClick={() => router.push('/tenant/subscription')}
              className="w-full h-11 sm:h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-sm font-medium rounded-xl shadow-md shadow-secondary/10"
            >
              Atur Paket Berlangganan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card variant="elevated" className="rounded-3xl">
        <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">Notifikasi</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Atur preferensi notifikasi untuk setiap peran staf.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {!Array.isArray(notifications) || notifications.length === 0 ? (
            <p className="text-xs sm:text-sm text-muted-foreground/50 font-medium text-center py-6 sm:py-8">
              Belum ada pengaturan notifikasi.
            </p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {notifications.map((notif: any) => (
                <div key={notif.id || notif.role} className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/20">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize">{notif.role}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Notifikasi untuk peran {notif.role}</p>
                  </div>
                  <Switch
                    checked={notif.is_active ?? true}
                    onCheckedChange={(checked) => toggleNotification(notif.role, checked)}
                    disabled={savingNotif === notif.role}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 shadow-sm rounded-3xl overflow-hidden bg-red-50/50">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            Zona Berbahaya
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-red-700/70">
            Tindakan di area ini tidak dapat dibatalkan. Harap berhati-hati.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {!showDeleteConfirm ? (
            <div className="flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Hapus Akun & Data Bisnis</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Menghapus akun akan memusnahkan seluruh data transaksi, produk, jurnal keuangan, dan akses staf.
                </p>
              </div>
              <Button
                variant="destructive"
                className="rounded-xl text-sm font-medium shadow-md h-10 sm:h-11 w-full sm:w-auto"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Hapus Akun Permanen
              </Button>
            </div>
          ) : (
            <div className="space-y-4 bg-white p-4 sm:p-6 rounded-2xl border border-red-100 shadow-sm">
              <h3 className="text-sm sm:text-base font-semibold text-red-600">Konfirmasi Penghapusan</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Ketik <strong className="text-red-600 font-semibold tracking-widest">HAPUS</strong> untuk mengonfirmasi.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Ketik HAPUS"
                  className="font-semibold tracking-widest uppercase text-red-600 border-red-200 focus-visible:ring-red-500 rounded-xl h-11 sm:h-12 text-sm"
                />
                <div className="flex gap-2.5 sm:flex-shrink-0">
                  <Button
                    variant="destructive"
                    className="rounded-xl text-sm font-medium h-11 sm:h-12 flex-1 sm:w-32"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || confirmText !== 'HAPUS'}
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : 'Konfirmasi'}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl text-sm font-medium h-11 sm:h-12 flex-1 sm:w-24"
                    onClick={() => { setShowDeleteConfirm(false); setConfirmText(''); }}
                    disabled={isDeleting}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
