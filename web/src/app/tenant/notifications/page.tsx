'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Loader2, AlertTriangle, CheckCircle, Info, ArrowRight, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { createClient } from '@/lib/supabase/client';
import { alertService } from '@/lib/api/alertService';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsPage() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await alertService.getAlerts();
      setAlerts(data || []);
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await alertService.markAsRead(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await alertService.markAllAsRead();
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
      toast({ title: 'Semua notifikasi ditandai sudah dibaca' });
    } catch (err) {
      console.error('Failed to mark all as read', err);
      toast({ title: 'Gagal menandai notifikasi', variant: 'destructive' });
    } finally {
      setMarkingAll(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue_bill':
      case 'budget_exceeded':
      case 'critical_stock':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'low_stock':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'goal_milestone':
      case 'bill_reminder':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'overdue_bill':
      case 'budget_exceeded':
      case 'critical_stock':
        return 'border-l-red-500';
      case 'low_stock':
        return 'border-l-amber-500';
      case 'goal_milestone':
      case 'bill_reminder':
        return 'border-l-blue-500';
      default:
        return 'border-l-slate-300';
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Notifikasi</h1>
          <p className="text-sm text-slate-500 font-medium">Peringatan dan pemberitahuan untuk bisnis Anda.</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="h-9 text-xs font-bold"
          >
            {markingAll ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCheck className="w-3 h-3 mr-1" />}
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-slate-50 p-5 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Aktivitas Terbaru
            {alerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">{alerts.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold text-lg">Tidak ada notifikasi</p>
              <p className="text-sm">Semua baik-baik saja!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 p-4 bg-slate-50 rounded-xl border-l-4 ${getAlertColor(alert.type)} hover:bg-slate-100 transition-colors cursor-pointer ${alert.is_read ? 'opacity-60' : ''}`}
                  onClick={() => {
                    if (!alert.is_read) handleMarkAsRead(alert.id);
                    if (alert.metadata?.bill_id) window.location.href = `/tenant/bills/${alert.metadata.bill_id}`;
                    else if (alert.metadata?.goal_id) window.location.href = '/tenant/personal/goals';
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-slate-700 text-sm">{alert.title || alert.message}</p>
                    {alert.description && (
                      <p className="text-xs text-slate-500 mt-1">{alert.description}</p>
                    )}
                    {alert.metadata?.amount && (
                      <p className="text-xs font-bold text-slate-600 mt-1">
                        Rp {Number(alert.metadata.amount).toLocaleString()}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {alert.created_at ? format(new Date(alert.created_at), 'dd MMM yyyy HH:mm', { locale: id }) : ''}
                    </p>
                  </div>
                  {!alert.is_read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
