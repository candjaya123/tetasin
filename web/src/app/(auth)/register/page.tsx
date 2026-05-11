"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  User, 
  Briefcase, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Zap,
  Bot,
  Crown
} from "lucide-react";

type AccountType = 'personal' | 'business';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const type = searchParams.get('type') as AccountType;
    if (type === 'personal' || type === 'business') {
      setAccountType(type);
      setStep(2);
    }
  }, [searchParams]);

  const translateAuthError = (message: string): string => {
    const msg = message.toLowerCase();
    if (msg.includes('user already registered') || msg.includes('already registered')) {
      return 'Email ini sudah pernah terdaftar.';
    }
    if (msg.includes('invalid email')) {
      return 'Format email tidak valid.';
    }
    if (msg.includes('password') && msg.includes('short')) {
      return 'Password minimal 8 karakter.';
    }
    return `Terjadi kesalahan: ${message}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          account_type: accountType,
          tier: 'full', // Always full
          business_name: accountType === 'business' ? businessName : 'Personal Workspace',
          role: accountType === 'personal' ? 'personal' : 'owner',
        },
      },
    });

    if (signUpError) {
      setError(translateAuthError(signUpError.message));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6 font-sans">
        <Card className="w-full max-w-md shadow-2xl border-none text-center py-12 px-8 rounded-[2.5rem] bg-white">
          <CardContent className="space-y-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-secondary tracking-tight">Cek Email Anda!</h2>
              <p className="text-muted-foreground font-medium mt-3 leading-relaxed">
                Verifikasi akun Anda melalui link yang kami kirim ke <strong className="text-secondary">{email}</strong>.
              </p>
            </div>
            <Link href="/login" className="block w-full">
              <Button className="w-full bg-secondary hover:bg-secondary/90 h-14 rounded-2xl font-black text-white transition-all shadow-xl shadow-secondary/10">
                Kembali ke Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6 py-12 font-sans relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
      
      <Card className="w-full max-w-xl shadow-[0_20px_60px_rgba(0,0,0,0.06)] border-none rounded-[2.5rem] overflow-hidden bg-white relative">
        <div className="bg-secondary p-10 text-center text-white relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-black text-3xl shadow-2xl shadow-primary/30">T</div>
            </div>
            <div>
              <CardTitle className="text-3xl font-black tracking-tight">Mulai Bertumbuh</CardTitle>
              <CardDescription className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">
                {step === 1 ? "Pilih Tipe Akun" : "Lengkapi Profil Anda"}
              </CardDescription>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
             <div 
               className="h-full bg-primary transition-all duration-500 ease-out" 
               style={{ width: `${(step / 2) * 100}%` }}
             />
          </div>
        </div>

        <CardContent className="p-10">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold mb-8 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div 
                onClick={() => setAccountType('personal')}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-6 group relative overflow-hidden ${
                  accountType === 'personal' 
                    ? 'border-primary bg-primary/5 shadow-inner' 
                    : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  accountType === 'personal' ? 'bg-primary text-primary-foreground rotate-6' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                }`}>
                  <User className="w-8 h-8" />
                </div>
                <div className="flex-grow">
                  <h3 className={`font-black text-xl ${accountType === 'personal' ? 'text-secondary' : 'text-slate-700'}`}>Personal</h3>
                  <p className="text-sm text-muted-foreground font-medium">Manajemen keuangan pribadi & aset.</p>
                </div>
                {accountType === 'personal' && <div className="bg-primary p-1.5 rounded-full"><Check className="w-4 h-4 text-primary-foreground stroke-[4px]" /></div>}
              </div>

              <div 
                onClick={() => setAccountType('business')}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-6 group relative overflow-hidden ${
                  accountType === 'business' 
                    ? 'border-primary bg-primary/5 shadow-inner' 
                    : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  accountType === 'business' ? 'bg-primary text-primary-foreground rotate-6' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                }`}>
                  <Briefcase className="w-8 h-8" />
                </div>
                <div className="flex-grow">
                  <h3 className={`font-black text-xl ${accountType === 'business' ? 'text-secondary' : 'text-slate-700'}`}>Bisnis</h3>
                  <p className="text-sm text-muted-foreground font-medium">Sistem Kasir & Laporan Keuangan ERP.</p>
                </div>
                {accountType === 'business' && <div className="bg-primary p-1.5 rounded-full"><Check className="w-4 h-4 text-primary-foreground stroke-[4px]" /></div>}
              </div>

              <Button 
                onClick={nextStep} 
                disabled={!accountType}
                className="w-full h-14 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black mt-8 rounded-2xl shadow-xl shadow-secondary/10 text-lg transition-all active:scale-[0.98]"
              >
                Lanjutkan
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</Label>
                <Input 
                  id="fullName" 
                  placeholder="Nama Lengkap Anda" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-14 bg-slate-50 border-border rounded-2xl font-bold px-5 focus:bg-white transition-all"
                  required 
                />
              </div>

              {accountType === 'business' && (
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nama Bisnis</Label>
                  <Input 
                    id="businessName" 
                    placeholder="Contoh: Kopi Tumbuh" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="h-14 bg-slate-50 border-border rounded-2xl font-bold px-5 focus:bg-white transition-all"
                    required 
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@perusahaan.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 bg-slate-50 border-border rounded-2xl font-bold px-5 focus:bg-white transition-all"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 bg-slate-50 border-border rounded-2xl font-bold px-5 focus:bg-white transition-all"
                  required 
                  minLength={8}
                />
              </div>

              <div className="flex gap-4 mt-10">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl font-black text-muted-foreground hover:bg-slate-100 p-0 flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button type="submit" className="flex-grow h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/20 text-lg transition-all active:scale-[0.98]" disabled={loading}>
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : "Buat Akun Sekarang"}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground font-bold tracking-tight">
              Sudah memiliki akun? <Link href="/login" className="text-secondary font-black hover:text-primary transition-colors underline underline-offset-4 decoration-primary/30">Masuk di sini</Link>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="fixed bottom-8 text-center text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">
        Step {step} of 2 • Tumbuhin Registration
      </div>
    </div>
  );
}
