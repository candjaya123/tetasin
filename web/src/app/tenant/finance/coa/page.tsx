'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Plus, 
  Search,
  Loader2,
  Filter,
  ArrowUpDown,
  Lock,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { createClient } from '@/lib/supabase/client';
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { id: '1', name: 'Aset', color: 'bg-blue-500' },
  { id: '2', name: 'Kewajiban', color: 'bg-amber-500' },
  { id: '3', name: 'Ekuitas', color: 'bg-purple-500' },
  { id: '4', name: 'Pendapatan', color: 'bg-green-500' },
  { id: '5', name: 'HPP', color: 'bg-red-500' },
  { id: '6', name: 'Beban Operasional', color: 'bg-slate-500' },
];

export default function CoaPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCats, setExpandedCats] = useState<string[]>(['1', '2', '3', '4', '5', '6']);
  const supabase = createClient();

  const fetchCOA = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .order('code');
    
    if (data) setAccounts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCOA();
  }, []);

  const toggleCat = (catId: string) => {
    setExpandedCats(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.code.includes(searchTerm)
  );

  const groupedAccounts = CATEGORIES.map(cat => ({
    ...cat,
    accounts: filteredAccounts.filter(acc => acc.code.startsWith(cat.id))
  }));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Chart of Accounts</h1>
          <p className="text-slate-500 font-medium">Standardisasi klasifikasi transaksi keuangan bisnis Anda.</p>
        </div>
        <div className="flex gap-3">
          <Button className="flex gap-2 bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg">
            <Plus className="w-4 h-4" />
            Tambah Akun
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-50 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-black text-slate-800">Daftar Akun</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Cari nama atau kode akun..." 
                className="pl-10 rounded-xl border-slate-100 bg-slate-50/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none">
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] pl-6 w-48">Kode Akun</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Nama Akun</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Kategori</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Saldo Normal</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400">Memuat Chart of Accounts...</p>
                  </TableCell>
                </TableRow>
              ) : groupedAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="font-bold">Data akun tidak ditemukan.</p>
                  </TableCell>
                </TableRow>
              ) : (
                groupedAccounts.map((group) => (
                  <React.Fragment key={group.id}>
                    <TableRow 
                      className="bg-slate-50/30 cursor-pointer hover:bg-slate-50/50 transition-colors"
                      onClick={() => toggleCat(group.id)}
                    >
                      <TableCell colSpan={5} className="py-3 pl-6 font-black text-slate-500 text-[11px] uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          {expandedCats.includes(group.id) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          <div className={`w-1.5 h-1.5 rounded-full ${group.color}`} />
                          {group.name} ({group.accounts.length})
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedCats.includes(group.id) && group.accounts.map((acc) => (
                      <TableRow key={acc.id} className="hover:bg-slate-50/20 border-slate-50">
                        <TableCell className="py-4 pl-8 font-mono text-[11px] text-slate-400 font-bold tracking-tighter">
                          {acc.code}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-slate-700">{acc.name}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest bg-slate-50 text-slate-400 border-none">
                            {acc.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${acc.normal_balance === 'debit' ? 'text-blue-500' : 'text-amber-500'}`}>
                            {acc.normal_balance}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          {acc.code.length <= 7 ? (
                            <Lock className="w-3 h-3 text-slate-300 ml-auto" />
                          ) : (
                            <Badge variant="outline" className="text-[8px] bg-green-50 text-green-600 border-green-100 font-bold uppercase">Kustom</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
