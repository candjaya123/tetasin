'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  getHppPreview,
  getProductVariants,
  getProductAddons,
} from '@/lib/api/inventoryService';
import type { Product, RawMaterial, HppPreview, ProductVariantGroup, ProductAddonGroup } from '@/types';

export function useProducts(tenantId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(tenantId);
      setProducts(data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { products, loading, error, refetch };
}

export function useProductDetail(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProductById(id);
      setProduct(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { product, loading, error, refetch };
}

export function useProductMutations() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(async (payload: Partial<Product> & { recipe?: any[] }) => {
    setSaving(true);
    setError(null);
    try {
      const result = await createProduct(payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const edit = useCallback(async (id: string, payload: Partial<Product>) => {
    setSaving(true);
    setError(null);
    try {
      const result = await updateProduct(id, payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteProduct(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { add, edit, remove, saving, error };
}

export function useRawMaterials(tenantId: string) {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRawMaterials(tenantId);
      setMaterials(data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { materials, loading, error, refetch };
}

export function useRawMaterialMutations() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(async (payload: Partial<RawMaterial>) => {
    setSaving(true);
    setError(null);
    try {
      return await createRawMaterial(payload);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const edit = useCallback(async (id: string, payload: Partial<RawMaterial>) => {
    setSaving(true);
    setError(null);
    try {
      return await updateRawMaterial(id, payload);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteRawMaterial(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { add, edit, remove, saving, error };
}

export function useHppPreview(productId: string) {
  const [hppPreview, setHppPreview] = useState<HppPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getHppPreview(productId);
      setHppPreview(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { hppPreview, loading, error, refetch };
}

export function useProductVariants(productId: string) {
  const [variants, setVariants] = useState<ProductVariantGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProductVariants(productId);
      setVariants(data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { variants, loading, error, refetch };
}

export function useProductAddons(productId: string) {
  const [addons, setAddons] = useState<ProductAddonGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProductAddons(productId);
      setAddons(data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { addons, loading, error, refetch };
}
