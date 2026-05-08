'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Rocket, Store, Calculator, Coffee, ShoppingBag, Scissors, Factory, Coins, TrendingUp, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

import { profileService } from '@/lib/api/profileService';

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

      router.push('/tenant');
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

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
        <h1 className="text-2xl font-bold text-slate-800 animate-pulse">
          {isPersonal ? 'Sedang menyiapkan dompet digital Anda...' : 'AI sedang merancang sistem akuntansi Anda...'}
        </h1>
        <p className="text-slate-500 mt-2 max-w-md">
          {isPersonal 
            ? 'Kami sedang mengatur kategori keuangan yang sesuai untuk Anda.'
            : 'Kami sedang menyiapkan Chart of Accounts (COA) dan struktur buku besar yang sesuai dengan profil bisnis Anda.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center font-sans">
      <Card className="w-full max-w-3xl shadow-2xl border-none rounded-3xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <CardTitle className="text-3xl font-black tracking-tight mb-2">
            {isPersonal ? 'Setup Personal Tracker' : 'Setup Profil Bisnis'}
          </CardTitle>
          <CardDescription className="text-blue-100 text-lg font-medium">
            {isPersonal 
              ? 'Mulai atur keuangan pribadi Anda dengan langkah mudah.'
              : 'Bantu AI memahami bisnis Anda agar sistem bisa dikonfigurasi dengan tepat.'}
          </CardDescription>
        </div>
        
        <CardContent className="space-y-10 p-8 md:p-12">
          {isPersonal ? (
            /* Personal Selection */
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Apa Tujuan Finansial Utama Anda?</h3>
              </div>
              <div className="flex flex-col gap-4">
                {goals.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setGoal(item.id)}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                      goal === item.id 
                        ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-600/20' 
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-4 rounded-xl transition-colors ${goal === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold ${goal === item.id ? 'text-blue-900' : 'text-slate-700'}`}>{item.title}</h4>
                      <p className="text-sm text-slate-500 font-medium mt-1">{item.desc}</p>
                    </div>
                    {goal === item.id && (
                      <div className="absolute top-1/2 -translate-y-1/2 right-6 w-4 h-4 bg-blue-600 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Industry Selection */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Store className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">1. Apa Industri Utama Bisnis Anda?</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {industries.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setIndustry(item.id)}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                        industry === item.id 
                          ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-600/20' 
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-3 rounded-xl transition-colors ${industry === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className={`font-bold ${industry === item.id ? 'text-blue-900' : 'text-slate-700'}`}>{item.title}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1">{item.desc}</p>
                      </div>
                      {industry === item.id && (
                        <div className="absolute top-4 right-4 w-3 h-3 bg-blue-600 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Scale Selection */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">2. Berapa Skala Bisnis Anda Saat Ini?</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {scales.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setScale(item.id)}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                        scale === item.id 
                          ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-600/20' 
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-3 rounded-xl transition-colors ${scale === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className={`font-bold ${scale === item.id ? 'text-blue-900' : 'text-slate-700'}`}>{item.title}</h4>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">{item.desc}</p>
                      </div>
                      {scale === item.id && (
                        <div className="absolute top-1/2 -translate-y-1/2 right-6 w-3 h-3 bg-blue-600 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Button 
            className="w-full h-16 text-lg font-black tracking-wide rounded-2xl shadow-xl shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-12"
            onClick={handleSetup}
            disabled={isPersonal ? !goal : (!industry || !scale)}
          >
            {isPersonal ? 'Mulai Mencatat' : 'Bangun Sistem Tumbuhin'} <Rocket className="w-6 h-6" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
