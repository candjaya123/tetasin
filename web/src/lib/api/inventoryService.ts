import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { Product, RawMaterial, ProductRecipe, HppPreview, ProductVariantGroup, ProductAddonGroup } from '@/types';

const BASE = 'inventory';

export const getProducts = async (tenantId: string): Promise<Product[]> => {
  const data = await apiGet<Product[]>(`api/v1/${BASE}/products`, { tenant_id: tenantId });
  return data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const data = await apiGet<Product>(`api/v1/${BASE}/products/${id}`);
  return data;
};

export const createProduct = async (payload: Partial<Product> & { recipe?: ProductRecipe[] }): Promise<Product> => {
  const data = await apiPost<Product>(`api/v1/${BASE}/products`, payload);
  return data;
};

export const updateProduct = async (id: string, payload: Partial<Product>): Promise<Product> => {
  const data = await apiPut<Product>(`api/v1/${BASE}/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await apiDelete(`api/v1/${BASE}/products/${id}`);
};

export const getRawMaterials = async (tenantId: string): Promise<RawMaterial[]> => {
  const data = await apiGet<RawMaterial[]>(`api/v1/${BASE}/raw-materials`, { tenant_id: tenantId });
  return data;
};

export const createRawMaterial = async (payload: Partial<RawMaterial>): Promise<RawMaterial> => {
  const data = await apiPost<RawMaterial>(`api/v1/${BASE}/raw-materials`, payload);
  return data;
};

export const updateRawMaterial = async (id: string, payload: Partial<RawMaterial>): Promise<RawMaterial> => {
  const data = await apiPut<RawMaterial>(`api/v1/${BASE}/raw-materials/${id}`, payload);
  return data;
};

export const deleteRawMaterial = async (id: string): Promise<void> => {
  await apiDelete(`api/v1/${BASE}/raw-materials/${id}`);
};

export const getHppPreview = async (productId: string): Promise<HppPreview> => {
  const data = await apiGet<HppPreview>(`api/v1/${BASE}/products/${productId}/hpp-preview`);
  return data;
};

export const getProductVariants = async (productId: string): Promise<ProductVariantGroup[]> => {
  const data = await apiGet<ProductVariantGroup[]>(`api/v1/${BASE}/products/${productId}/variants`);
  return data;
};

export const getProductAddons = async (productId: string): Promise<ProductAddonGroup[]> => {
  const data = await apiGet<ProductAddonGroup[]>(`api/v1/${BASE}/products/${productId}/addons`);
  return data;
};

// Recipe CRUD
export const getProductRecipes = async (productId: string): Promise<ProductRecipe[]> => {
  const data = await apiGet<ProductRecipe[]>(`api/v1/${BASE}/products/${productId}/recipes`);
  return data;
};

export const addProductRecipe = async (productId: string, payload: { raw_material_id: string; quantity_needed: number }): Promise<ProductRecipe> => {
  const data = await apiPost<ProductRecipe>(`api/v1/${BASE}/products/${productId}/recipes`, payload);
  return data;
};

export const updateProductRecipe = async (productId: string, recipeId: string, payload: Partial<{ raw_material_id: string; quantity_needed: number }>): Promise<ProductRecipe> => {
  const data = await apiPut<ProductRecipe>(`api/v1/${BASE}/products/${productId}/recipes/${recipeId}`, payload);
  return data;
};

export const deleteProductRecipe = async (productId: string, recipeId: string): Promise<void> => {
  await apiDelete(`api/v1/${BASE}/products/${productId}/recipes/${recipeId}`);
};

// Variant Group CRUD
export const upsertVariantGroup = async (productId: string, payload: any): Promise<ProductVariantGroup> => {
  const data = await apiPost<ProductVariantGroup>(`api/v1/${BASE}/products/${productId}/variant-groups`, payload);
  return data;
};

export const deleteVariantGroup = async (groupId: string): Promise<void> => {
  await apiDelete(`api/v1/${BASE}/variant-groups/${groupId}`);
};

export const upsertVariantOption = async (productId: string, groupId: string, payload: any): Promise<any> => {
  const data = await apiPost<any>(`api/v1/${BASE}/products/${productId}/variant-groups/${groupId}/options`, payload);
  return data;
};

export const deleteVariantOption = async (optionId: string): Promise<void> => {
  await apiDelete(`api/v1/${BASE}/variant-options/${optionId}`);
};

// Addon Group CRUD
export const upsertAddonGroup = async (productId: string, payload: any): Promise<ProductAddonGroup> => {
  const data = await apiPost<ProductAddonGroup>(`api/v1/${BASE}/products/${productId}/addon-groups`, payload);
  return data;
};

export const deleteAddonGroup = async (groupId: string): Promise<void> => {
  await apiDelete(`api/v1/${BASE}/addon-groups/${groupId}`);
};

export const upsertAddon = async (productId: string, groupId: string, payload: any): Promise<any> => {
  const data = await apiPost<any>(`api/v1/${BASE}/products/${productId}/addon-groups/${groupId}/addons`, payload);
  return data;
};

export const deleteAddon = async (addonId: string): Promise<void> => {
  await apiDelete(`api/v1/${BASE}/addons/${addonId}`);
};
