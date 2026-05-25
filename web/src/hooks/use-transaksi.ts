'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTransactions, getTransactionById } from '@/lib/api/transactionService';
import type { Transaction } from '@/types';

export function useTransaksiList(tenantId: string, params?: {
  source_type?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions(tenantId, params);
      setTransactions(data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tenantId, JSON.stringify(params)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { transactions, loading, error, refetch };
}

export function useTransaksiDetail(id: string) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactionById(id);
      setTransaction(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { transaction, loading, error, refetch };
}
