'use client';

import { useState, useEffect, useCallback } from 'react';
import { orderService } from '@/lib/api/orderService';

export function usePesananList(params?: { status?: string; source?: string }) {
  const [pesanan, setPesanan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrders(params);
      setPesanan(data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { pesanan, loading, error, refetch };
}

export function usePesananDetail(id: string) {
  const [pesanan, setPesanan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrderById(id);
      setPesanan(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { pesanan, loading, error, refetch };
}

export function useUpdatePesananStatus() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(async (
    id: string,
    status: string,
    division_note?: string,
    division?: string,
  ) => {
    setUpdating(true);
    setError(null);
    try {
      await orderService.updateOrderStatus(id, status, division_note, division);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  const voidOrder = useCallback(async (id: string) => {
    setUpdating(true);
    setError(null);
    try {
      await orderService.voidOrder(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  return { updateStatus, voidOrder, updating, error };
}
