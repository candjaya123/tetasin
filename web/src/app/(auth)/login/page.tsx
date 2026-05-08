"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, ArrowRight } from "lucide-react";

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

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, industry')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      // If auth successful but no profile, it means account was deleted
      await supabase.auth.signOut();
      setError("Email belum terdaftar atau akun telah dihapus.");
      setLoading(false);
      return;
    }

    if (profile.role === 'super_admin') {
      router.push('/admin');
      router.refresh();
    } else {
      if (!profile.industry) {
        router.push('/tenant/onboarding');
      } else {
        router.push('/tenant');
      }
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6 py-12 font-sans relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
      
      <Card className="w-full max-w-xl shadow-[0_20px_60px_rgba(0,0,0,0.06)] border-none rounded-[2.5rem] overflow-hidden bg-white relative">
        <div className="bg-secondary p-12 text-center text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-black text-4xl shadow-2xl shadow-primary/20">T</div>
            </div>
            <div>
              <CardTitle className="text-4xl font-black tracking-tight">Selamat Datang</CardTitle>
              <CardDescription className="text-slate-400 font-black mt-2 uppercase tracking-[0.2em] text-[10px]">
                Kembali Tumbuh Bersama Kami
              </CardDescription>
            </div>
          </div>
        </div>

        <CardContent className="p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nama@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-slate-50 border-border rounded-2xl font-bold px-5 focus:bg-white transition-all"
                required 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400">Password</Label>
                <Link href="#" className="text-xs text-primary font-black hover:underline underline-offset-4">Lupa Password?</Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 bg-slate-50 border-border rounded-2xl font-bold px-5 focus:bg-white transition-all"
                required 
              />
            </div>

            <div className="pt-4 space-y-6">
              <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/20 text-lg transition-all active:scale-[0.98]" disabled={loading}>
                {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : (
                  <span className="flex items-center gap-2">
                    Masuk ke Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground font-bold tracking-tight">
                  Belum memiliki akun? <Link href="/register" className="text-secondary font-black hover:text-primary transition-colors underline underline-offset-4 decoration-primary/30">Daftar Gratis</Link>
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="fixed bottom-8 text-center text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">
        © 2026 Tumbuhin Authentication
      </div>
    </div>
  );
}
