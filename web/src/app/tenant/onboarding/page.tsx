'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Rocket, Store, Calculator, Coffee, ShoppingBag, Scissors, Factory, Coins, TrendingUp, Building2, Check, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

import { profileService } from '@/lib/api/profileService';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  const [industry, setIndustry] = useState('');
  const [scale, setScale] = useState('');
  const [goal, setGoal] = useState('');

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const industries = [
    { id: 'F&B', title: 'Makanan & Minuman', desc: 'Kafe, Resto, Warung', icon: Coffee },
    { id: 'Retail', title: 'Retail & Dagang', desc: 'Minimarket, Butik', icon: ShoppingBag },
    { id: 'Jasa', title: 'Jasa & Layanan', desc: 'Salon, Agensi, Freelance', icon: Scissors },
    { id: 'Manufaktur', title: 'Produksi', desc: 'Pabrik, Kerajinan', icon: Factory },
  ];

  const scales = [
    { id: 'Mikro', title: 'Usaha Mikro', desc: 'Omset < Rp 50 Juta/bln', icon: Coins },
    { id: 'Kecil', title: 'Usaha Kecil', desc: 'Omset Rp 50Jt - 300Jt/bln', icon: TrendingUp },
    { id: 'Menengah', title: 'Usaha Menengah', desc: 'Omset > Rp 300 Juta/bln', icon: Building2 },
  ];

  const goals = [
    { id: 'track', title: 'Catat Harian', desc: 'Memantau pengeluaran & pemasukan', icon: Calculator },
    { id: 'debt', title: 'Lunasi Hutang', desc: 'Fokus pada pelunasan kewajiban', icon: Coins },
    { id: 'save', title: 'Menabung Ketat', desc: 'Membangun dana darurat/tabungan', icon: TrendingUp },
  ];

  const handleSetup = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/onboarding/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          industry: isPersonal ? 'Personal' : industry,
          scale: isPersonal ? 'Personal' : scale,
          complexity: 'Sederhana',
          goal: isPersonal ? goal : undefined,
        }),
      });

      if (!response.ok) throw new Error('Gagal membangun sistem');

      toast({
        title: "Sistem Berhasil Dibangun! 🚀",
        description: isPersonal 
          ? "Tracker keuangan pribadi Anda telah siap digunakan."
          : "Buku besar dan modul Anda telah dikonfigurasi otomatis oleh AI.",
      });

      // Redirect to tier selection
      router.push('/tenant/subscription');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Waduh, ada masalah!",
        description: error instanceof Error ? error.message : "Terjadi kesalahan sistem",
      });
    } finally {
      setLoading(false);
    }
  };

  const isPersonal = profile?.account_type === 'personal';

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA] p-6 text-center font-sans">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
        <h1 className="text-2xl font-black text-slate-800 animate-pulse tracking-tight">
          Memuat Data...
        </h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6 font-sans">
        <Card className="w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.06)] border-none text-center py-12 px-8 rounded-[2.5rem] bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse"></div>
          <CardContent className="space-y-8">
            <div className="flex justify-center relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center relative border border-primary/20 rotate-3 transition-transform">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-secondary tracking-tight">
                {isPersonal ? 'Menyiapkan Dompet...' : 'Merancang Sistem AI...'}
              </h2>
              <p className="text-muted-foreground font-medium mt-3 leading-relaxed">
                {isPersonal 
                  ? 'Kami sedang mengatur kategori keuangan yang sesuai untuk Anda.'
                  : 'Kami sedang menyiapkan Chart of Accounts (COA) dan struktur buku besar yang sesuai dengan profil bisnis Anda.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 flex items-center justify-center font-sans relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
      
      <div className="w-full max-w-3xl flex flex-col gap-4 relative z-10 animate-scale-in">
        <div className="flex justify-end">
          <ThemeToggle position="inline" />
        </div>
        <Card className="w-full shadow-[0_20px_60px_rgba(0,0,0,0.06)] border-none rounded-[2.5rem] overflow-hidden bg-white relative">
        <div className="bg-secondary p-12 text-center text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-black shadow-2xl shadow-primary/20">
                <Rocket className="w-10 h-10" />
              </div>
            </div>
            <div>
              <CardTitle className="text-4xl font-black tracking-tight">
                {isPersonal ? 'Setup Personal Tracker' : 'Setup Profil Bisnis'}
              </CardTitle>
              <CardDescription className="text-slate-300 font-bold mt-3 uppercase tracking-widest text-xs max-w-md mx-auto">
                {isPersonal 
                  ? 'MULAI ATUR KEUANGAN PRIBADI ANDA DENGAN LANGKAH MUDAH.'
                  : 'BANTU AI MEMAHAMI BISNIS ANDA AGAR SISTEM BISA DIKONFIGURASI DENGAN TEPAT.'}
              </CardDescription>
            </div>
          </div>
        </div>
        
        <CardContent className="space-y-12 p-8 md:p-12">
          {isPersonal ? (
            /* Personal Selection */
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Calculator className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Apa Tujuan Finansial Utama Anda?</h3>
              </div>
              <div className="flex flex-col gap-4">
                {goals.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setGoal(item.id)}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-6 group overflow-hidden ${
                      goal === item.id 
                        ? 'border-primary bg-primary/5 shadow-inner' 
                        : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      goal === item.id ? 'bg-primary text-primary-foreground rotate-6 shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                    }`}>
                      <item.icon className="w-8 h-8" />
                    </div>
                    <div className="flex-grow">
                      <h4 className={`text-xl font-black ${goal === item.id ? 'text-secondary' : 'text-slate-700'}`}>{item.title}</h4>
                      <p className="text-sm text-muted-foreground font-medium mt-1">{item.desc}</p>
                    </div>
                    {goal === item.id && (
                      <div className="bg-primary p-1.5 rounded-full z-10 shadow-lg">
                        <Check className="w-5 h-5 text-primary-foreground stroke-[4px]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Industry Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Store className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Apa Industri Utama Bisnis Anda?</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {industries.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setIndustry(item.id)}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 group overflow-hidden ${
                        industry === item.id 
                          ? 'border-primary bg-primary/5 shadow-inner' 
                          : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                        industry === item.id ? 'bg-primary text-primary-foreground rotate-6 shadow-md shadow-primary/20' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                      }`}>
                        <item.icon className="w-7 h-7" />
                      </div>
                      <div className="flex-grow">
                        <h4 className={`text-lg font-black ${industry === item.id ? 'text-secondary' : 'text-slate-700'}`}>{item.title}</h4>
                        <p className="text-xs text-muted-foreground font-medium mt-1">{item.desc}</p>
                      </div>
                      {industry === item.id && (
                        <div className="absolute top-4 right-4 bg-primary p-1 rounded-full shadow-md">
                          <Check className="w-3 h-3 text-primary-foreground stroke-[4px]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Scale Selection */}
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Berapa Skala Bisnis Saat Ini?</h3>
                </div>
                <div className="flex flex-col gap-4">
                  {scales.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setScale(item.id)}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-5 group overflow-hidden ${
                        scale === item.id 
                          ? 'border-primary bg-primary/5 shadow-inner' 
                          : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                        scale === item.id ? 'bg-primary text-primary-foreground rotate-6 shadow-md shadow-primary/20' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                      }`}>
                        <item.icon className="w-7 h-7" />
                      </div>
                      <div className="flex-grow">
                        <h4 className={`text-lg font-black ${scale === item.id ? 'text-secondary' : 'text-slate-700'}`}>{item.title}</h4>
                        <p className="text-sm text-muted-foreground font-medium mt-1">{item.desc}</p>
                      </div>
                      {scale === item.id && (
                        <div className="bg-primary p-1.5 rounded-full z-10 shadow-md">
                          <Check className="w-4 h-4 text-primary-foreground stroke-[4px]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="pt-8">
            <Button 
              className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              onClick={handleSetup}
              disabled={isPersonal ? !goal : (!industry || !scale)}
            >
              {isPersonal ? 'Mulai Mencatat Sekarang' : 'Bangun Sistem Tetasin'} 
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
