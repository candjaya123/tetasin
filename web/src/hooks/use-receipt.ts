'use client';

import { useState, useEffect, useCallback } from 'react';
import { receiptService } from '@/lib/api/receiptService';

export function useDrafts(status?: string) {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await receiptService.getDrafts();
      const filtered = status ? data.filter((d: any) => d.status === status) : data;
      setDrafts(filtered ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { drafts, loading, error, refetch };
}
