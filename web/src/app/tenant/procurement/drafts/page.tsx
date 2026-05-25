'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { DocumentBuilder } from '@/components/procurement/DocumentBuilder';

export default function ProcurementDraftsPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/procurement/drafts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Gagal mengambil data draft PO');
        const data = await response.json();
        setDrafts(data);
      } catch (error) {
        console.error('Error fetching drafts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [supabase]);

  const handleApprove = (approvedData: any) => {
    alert(`Purchase Order ${approvedData.reference} berhasil diterbitkan! 🚀`);
    setDrafts(drafts.filter(d => d.id !== approvedData.id));
    setSelectedDraft(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedDraft) {
    return (
      <div className="pb-10">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => setSelectedDraft(null)}>
          <ChevronRight className="w-4 h-4 rotate-180" />
          Kembali ke Daftar Draft
        </Button>
        <DocumentBuilder 
          draft={selectedDraft} 
          onApprove={handleApprove} 
          onCancel={() => setSelectedDraft(null)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            AI Procurement
          </h1>
        </div>
        <p className="text-slate-500 font-medium">Tinjau usulan pembelian barang yang dirakit oleh AI Autopilot</p>
      </div>

      <div className="bg-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Sparkles className="w-4 h-4" />
            Smart Inventory Autopilot
          </div>
          <h2 className="text-2xl font-black leading-tight">AI mendeteksi {drafts.length} kebutuhan restok mendesak untuk operasional Anda.</h2>
          <p className="text-sm text-white/60 leading-relaxed font-medium">
            Mesin Autopilot kami memantau pergerakan stok setiap jam. Draft PO dibuat secara otomatis ketika sisa stok diperkirakan tidak cukup untuk memenuhi permintaan 7 hari ke depan.
          </p>
        </div>
        <Sparkles className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {drafts.map((draft) => (
          <Card 
            key={draft.id} 
            className="border-none shadow-sm hover:shadow-md transition-all group bg-white cursor-pointer"
            onClick={() => setSelectedDraft(draft)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-primary/10 transition-colors">
                <FileText className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                Dibuat {new Date(draft.created_at).toLocaleDateString('id-ID')}
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <h3 className="font-black text-slate-800 text-lg leading-tight">{draft.reference}</h3>
                <p className="text-sm font-semibold text-slate-400 mt-1">{draft.vendor_name}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Item Usulan:</p>
                <div className="space-y-1">
                  {draft.items.slice(0, 2).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-medium">• {item.product_name}</span>
                      <span className="font-bold text-slate-800">{item.quantity} Unit</span>
                    </div>
                  ))}
                  {draft.items.length > 2 && (
                    <p className="text-[10px] text-primary font-bold">+{draft.items.length - 2} item lainnya</p>
                  )}
                </div>
              </div>

              <Button className="w-full justify-between group-hover:bg-primary transition-colors h-11 rounded-xl">
                Tinjau Draft
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {drafts.length === 0 && (
          <Card className="col-span-full border-2 border-dashed border-slate-200 bg-transparent flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <CheckCircle2 className="w-12 h-12 text-slate-300" />
            <div className="text-center">
              <p className="font-bold text-slate-500">Semua Stok Aman</p>
              <p className="text-xs text-slate-400 font-medium">AI Autopilot belum mendeteksi kebutuhan restok saat ini.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
