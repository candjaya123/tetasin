"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      let customError = loginError.message;
      if (loginError.message === 'Invalid login credentials') {
        customError = "Email belum terdaftar atau kata sandi salah. Silakan periksa kembali.";
      }
      setError(customError);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, account_type, tenant_id')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setError("Email belum terdaftar atau akun telah dihapus.");
      setLoading(false);
      return;
    }

    if (profile.role === 'super_admin') {
      router.push('/admin');
      router.refresh();
    } else {
      router.push('/tenant');
      router.refresh();
    }
    setLoading(false);
  };

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
              <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Selamat Datang</CardTitle>
              <CardDescription className="hidden sm:block text-slate-400 font-medium mt-1.5 sm:mt-2 uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                Kembali Bertumbuh Bersama Kami
              </CardDescription>
            </div>
          </div>
        </div>

        <CardContent className="p-5 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-medium animate-scale-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                  className="h-10 sm:h-12 rounded-2xl font-medium px-4 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <Link href="#" className="text-xs text-primary font-semibold hover:underline underline-offset-4">
                  Lupa?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                  className="h-10 sm:h-12 rounded-2xl font-medium px-4 text-sm"
                required
              />
            </div>

            <div className="pt-3 space-y-4">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl shadow-lg shadow-primary/20 transition-all h-12 sm:h-14 text-base"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    Masuk ke Dashboard
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <Link href="/register" className="text-foreground font-semibold hover:text-primary transition-colors underline underline-offset-4 decoration-primary/20">
                  Daftar Gratis
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
