'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { profileService } from '@/lib/api/profileService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Loader2, Settings, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'HAPUS') {
      toast({
        variant: 'destructive',
        title: 'Konfirmasi Gagal',
        description: 'Silakan ketik HAPUS untuk mengonfirmasi.',
      });
      return;
    }

    setIsDeleting(true);
    try {
      await profileService.deleteAccount();
      
      // Sign out from Supabase Auth locally
      await supabase.auth.signOut();
      
      toast({
        title: 'Akun Dihapus',
        description: 'Semua data bisnis Anda telah berhasil dihapus.',
      });
      
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menghapus Akun',
        description: error.message || 'Terjadi kesalahan sistem',
      });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setConfirmText('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-secondary tracking-tight">Pengaturan</h1>
      </div>

      {/* General Settings Placeholder */}
      <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-white/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Profil Bisnis</CardTitle>
          <CardDescription>Atur informasi umum terkait bisnis Anda di sini.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">Fitur profil bisnis sedang dalam pengembangan.</p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 shadow-sm rounded-3xl overflow-hidden bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Zona Berbahaya
          </CardTitle>
          <CardDescription className="text-red-700/70">
            Tindakan di area ini tidak dapat dibatalkan. Harap berhati-hati.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800">Hapus Akun & Data Bisnis</h3>
                <p className="text-sm text-slate-600 mt-1 max-w-lg">
                  Menghapus akun akan memusnahkan seluruh data transaksi, produk, jurnal keuangan, dan akses staf. Data yang sudah dihapus tidak dapat dipulihkan.
                </p>
              </div>
              <Button 
                variant="destructive" 
                className="rounded-xl font-bold shadow-md h-11 shrink-0"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Akun Permanen
              </Button>
            </div>
          ) : (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-red-100 shadow-sm animate-in fade-in zoom-in-95">
              <div>
                <h3 className="font-black text-lg text-red-600">Konfirmasi Penghapusan</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Ketik <strong className="text-red-600 font-black tracking-widest">HAPUS</strong> di bawah ini untuk mengonfirmasi bahwa Anda mengerti risikonya.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Ketik HAPUS"
                  className="font-black tracking-widest uppercase text-red-600 border-red-200 focus-visible:ring-red-500 rounded-xl h-12"
                />
                <Button 
                  variant="destructive" 
                  className="rounded-xl font-black h-12 shrink-0 sm:w-40 shadow-lg shadow-red-500/20"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmText !== 'HAPUS'}
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Konfirmasi'}
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-xl font-bold h-12 shrink-0"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setConfirmText('');
                  }}
                  disabled={isDeleting}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
