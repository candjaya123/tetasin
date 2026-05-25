"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { ThemeToggle } from '@/components/shared/ThemeToggle';

type AccountType = 'personal' | 'business';

function RegisterPageContent() {
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
          tier: 'free',
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

    if (data.session) {
      router.push('/tenant/onboarding');
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  if (success) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-6 font-sans relative overflow-hidden">
        <ThemeToggle />
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <Card className="w-full max-w-md mx-auto shadow-2xl shadow-slate-900/5 border-border/40 text-center py-12 px-8 rounded-[2rem] sm:rounded-[3rem] bg-white/80 backdrop-blur-xl relative z-10 animate-scale-in">
          <CardContent className="space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Cek Email Anda!</h2>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Verifikasi akun Anda melalui link yang kami kirim ke{" "}
                <strong className="text-foreground">{email}</strong>.
              </p>
            </div>
            <Link href="/login" className="block w-full">
              <Button className="w-full bg-secondary hover:bg-secondary/90 h-12 sm:h-14 rounded-2xl font-semibold text-secondary-foreground transition-all shadow-lg shadow-secondary/10">
                Kembali ke Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4 sm:p-6 font-sans relative overflow-hidden">
      <ThemeToggle />
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[45%] h-[45%] bg-amber-300/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

      <Card className="w-full max-w-md mx-auto shadow-2xl shadow-slate-900/5 border-border/40 rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl relative z-10 animate-scale-in">
        <div className="bg-secondary p-5 sm:p-10 text-center text-secondary-foreground relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 sm:w-40 sm:h-40 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 sm:w-40 sm:h-40 bg-primary/10 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-2.5 sm:space-y-4">
            <div className="flex justify-center">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-xl sm:text-3xl shadow-xl shadow-primary/25">
                T
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Mulai Bertumbuh</CardTitle>
              <CardDescription className="text-slate-400 font-medium mt-1.5 sm:mt-2 uppercase tracking-widest text-[10px] sm:text-xs">
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

        <CardContent className="p-5 sm:p-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-medium mb-5 animate-scale-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div
                onClick={() => setAccountType('personal')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 group relative overflow-hidden ${
                  accountType === 'personal'
                    ? 'border-primary bg-primary/5 shadow-inner'
                    : 'border-border/50 hover:border-primary/30 hover:bg-muted/20'
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                  accountType === 'personal'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-grow">
                  <h3 className={`font-semibold text-base ${accountType === 'personal' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Personal
                  </h3>
                  <p className="text-sm text-muted-foreground">Manajemen keuangan pribadi & aset.</p>
                </div>
                {accountType === 'personal' && (
                  <div className="bg-primary p-1 rounded-full shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
              </div>

              <div
                onClick={() => setAccountType('business')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 group relative overflow-hidden ${
                  accountType === 'business'
                    ? 'border-primary bg-primary/5 shadow-inner'
                    : 'border-border/50 hover:border-primary/30 hover:bg-muted/20'
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                  accountType === 'business'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                }`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="flex-grow">
                  <h3 className={`font-semibold text-base ${accountType === 'business' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Bisnis
                  </h3>
                  <p className="text-sm text-muted-foreground">Sistem Kasir & Laporan Keuangan ERP.</p>
                </div>
                {accountType === 'business' && (
                  <div className="bg-primary p-1 rounded-full shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
              </div>

              <Button
                onClick={nextStep}
                disabled={!accountType}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold mt-4 rounded-2xl shadow-lg shadow-secondary/10 transition-all h-11 sm:h-13 text-base"
              >
                Lanjutkan
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  Nama Lengkap
                </Label>
                <Input
                  id="fullName"
                  placeholder="Nama Lengkap Anda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10 sm:h-12 rounded-2xl font-medium px-4 text-sm"
                  required
                />
              </div>

              {accountType === 'business' && (
                <div className="space-y-1.5">
                  <Label htmlFor="businessName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                    Nama Bisnis
                  </Label>
                  <Input
                    id="businessName"
                    placeholder="Contoh: Kopi Tumbuh"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="h-10 sm:h-12 rounded-2xl font-medium px-4 text-sm"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@perusahaan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 sm:h-12 rounded-2xl font-medium px-4 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 sm:h-12 rounded-2xl font-medium px-4 text-sm"
                  required
                  minLength={8}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  className="h-11 sm:h-12 w-11 sm:w-12 rounded-2xl font-medium text-muted-foreground hover:bg-muted p-0 flex items-center justify-center shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  type="submit"
                  className="flex-grow bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl shadow-lg shadow-primary/20 transition-all h-11 sm:h-12 text-base"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" /> : "Buat Akun Sekarang"}
                </Button>
              </div>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-foreground font-semibold hover:text-primary transition-colors underline underline-offset-4 decoration-primary/20">
              Masuk di sini
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
