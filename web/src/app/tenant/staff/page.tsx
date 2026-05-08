'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail,
  History,
  MoreVertical,
  CheckCircle2,
  Clock
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
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import Link from 'next/link';
import { staffService } from '@/lib/api/staffService';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('kasir');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await staffService.getStaff();
      if (data) setStaff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!email) return;
    try {
      await staffService.inviteStaff(email, role);
      setIsInviting(false);
      setEmail('');
      fetchStaff();
      alert("Undangan berhasil dikirim!");
    } catch (err) {
      alert("Gagal mengirim undangan");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Staf</h1>
          <p className="text-slate-500">Kelola anggota tim dan hak akses mereka.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/tenant/staff/audit-log">
            <Button variant="outline" className="flex gap-2">
              <History className="w-4 h-4" />
              Log Aktivitas
            </Button>
          </Link>
          <Button className="flex gap-2" onClick={() => setIsInviting(!isInviting)}>
            <UserPlus className="w-4 h-4" />
            Undang Staf
          </Button>
        </div>
      </div>

      {isInviting && (
        <Card className="border-none shadow-lg bg-slate-50 border border-slate-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Kirim Undangan Akses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 items-end">
              <div className="flex-1 space-y-2">
                <Label>Email Calon Staf</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" />
              </div>
              <div className="w-64 space-y-2">
                <Label>Pilih Peran (Role)</Label>
                <Select value={role} onValueChange={(val) => setRole(val || '')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manajer">Manajer (Akses Penuh)</SelectItem>
                    <SelectItem value="kasir">Kasir (Transaksi Saja)</SelectItem>
                    <SelectItem value="gudang">Gudang (Inventori Saja)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="px-10 font-bold" onClick={handleInvite}>Kirim Undangan</Button>
            </div>
            <p className="mt-4 text-xs text-slate-400">Calon staf akan menerima email instruksi untuk bergabung ke tenant Anda.</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Nama & Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terakhir Aktif</TableHead>
                <TableHead className="text-right pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400">Memuat data staf...</TableCell>
                </TableRow>
              ) : staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400">Belum ada staf terdaftar.</TableCell>
                </TableRow>
              ) : (
                staff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                          {s.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{s.name || 'User Baru'}</p>
                          <p className="text-xs text-slate-400">{s.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-primary">
                        <Shield size={12} />
                        {s.role}
                      </div>
                    </TableCell>
                    <TableCell>
                      {s.is_active ? (
                        <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle2 size={12}/> Aktif</span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500 font-bold text-xs"><Clock size={12}/> Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {s.last_active ? new Date(s.last_active).toLocaleString() : 'Belum pernah'}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
