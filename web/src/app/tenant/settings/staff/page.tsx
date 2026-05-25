'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Key,
  Mail,
  Loader2,
  ShieldAlert
} from "lucide-react";

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newStaff, setNewStaff] = useState({ email: '', pin: '', role: 'cashier' });
  const supabase = createClient();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Gagal mengambil data staf');
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    // Simulasi penambahan staf
    // Di produksi, kita butuh profile_id dari email (bisa via backend lookup)
    alert("Fitur pendaftaran staf melalui email akan mengirimkan undangan aktivasi. (Simulasi)");
    setIsAdding(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Manajemen Staf
          </h1>
          <p className="text-slate-500 font-medium">Kelola hak akses dan peran tim operasional Anda</p>
        </div>
        <Button className="gap-2 rounded-xl" onClick={() => setIsAdding(true)}>
          <UserPlus className="w-4 h-4" />
          Tambah Staf Baru
        </Button>
      </div>

      {isAdding && (
        <Card className="border-2 border-primary/20 shadow-xl bg-primary/5">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Email Staf</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="email@staf.com" 
                    className="pl-10 h-11 rounded-xl"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Role / Peran</label>
                <select 
                  className="w-full h-11 px-4 rounded-xl border bg-white font-bold text-sm"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                >
                  <option value="cashier">Kasir (POS Only)</option>
                  <option value="manager">Manajer (Full Access)</option>
                  <option value="warehouse_staff">Staf Gudang</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">PIN Login (4 Digit)</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="1234" 
                    maxLength={4}
                    className="pl-10 h-11 rounded-xl font-mono tracking-widest"
                    value={newStaff.pin}
                    onChange={(e) => setNewStaff({...newStaff, pin: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 h-11 rounded-xl" onClick={handleAddStaff}>Simpan Staf</Button>
                <Button variant="ghost" className="h-11 rounded-xl" onClick={() => setIsAdding(false)}>Batal</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <Card key={member.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
            <div className={`h-1 w-full ${member.role === 'manager' ? 'bg-indigo-500' : 'bg-primary'}`} />
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${member.role === 'manager' ? 'bg-indigo-50' : 'bg-primary/10'}`}>
                    <ShieldCheck className={`w-6 h-6 ${member.role === 'manager' ? 'text-indigo-600' : 'text-primary'}`} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">{member.profiles?.full_name || 'Staf Belum Aktif'}</h3>
                    <p className="text-xs font-semibold text-slate-400">{member.profiles?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${member.role === 'manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                  {member.role}
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-3 h-3 text-slate-300" />
                  <span className="text-xs font-bold text-slate-400">PIN: ****</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {staff.length === 0 && (
          <Card className="col-span-full border-2 border-dashed border-slate-200 bg-transparent flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <ShieldAlert className="w-12 h-12 text-slate-300" />
            <div className="text-center">
              <p className="font-bold text-slate-500">Belum Ada Staf Tambahan</p>
              <p className="text-xs text-slate-400 font-medium">Hanya Anda (Owner) yang memiliki akses ke sistem saat ini.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
