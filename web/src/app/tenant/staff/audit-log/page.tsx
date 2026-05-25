'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronLeft, 
  History, 
  Search, 
  Download,
  AlertCircle,
  Activity,
  Info
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
import Link from 'next/link';
import { staffService } from '@/lib/api/staffService';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await staffService.getAuditLogs();
        if (data) setLogs(data as any[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tenant/staff">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Log Aktivitas</h1>
            <p className="text-slate-500">Rekam jejak setiap aksi kritis yang dilakukan di sistem.</p>
          </div>
        </div>
        <Button variant="outline" className="flex gap-2">
          <Download className="w-4 h-4" />
          Ekspor CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-blue-50 border border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Total Aksi</p>
                <h3 className="text-2xl font-black text-blue-800">{logs.length}</h3>
              </div>
              <Activity className="text-blue-200 w-10 h-10" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Waktu</TableHead>
                <TableHead>Pengguna</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Modul</TableHead>
                <TableHead className="pr-6">Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400">Memuat log aktivitas...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400">Belum ada rekaman aktivitas.</TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="pl-6 text-xs text-slate-500 font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-slate-800">{log.user_name || 'System'}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        log.action.includes('VOID') || log.action.includes('DELETE') ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-slate-600">{log.module}</TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Info size={14} className="text-slate-300" />
                        {log.description}
                      </div>
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
