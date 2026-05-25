'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProductDetail, useHppPreview } from '@/hooks/use-inventory';
import { HppModeBadge } from '@/components/inventory/HppModeBadge';
import { RecipeBuilder } from '@/components/inventory/RecipeBuilder';
import { HppPreviewCard } from '@/components/inventory/HppPreviewCard';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Package, DollarSign, Save } from "lucide-react";
import { apiGet } from '@/lib/api/client';
import { getProductRecipes, addProductRecipe, updateProductRecipe, deleteProductRecipe } from '@/lib/api/inventoryService';
import type { RawMaterial, ProductRecipe } from '@/types';
import { useToast } from '@/hooks/use-toast';

const formatter = new Intl.NumberFormat('id-ID');

interface IngredientRow {
  id?: string;
  raw_material_id: string;
  name: string;
  unit: string;
  unit_price: number;
  quantity_needed: number;
}

export default function RecipePage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { product, loading: productLoading } = useProductDetail(id);
  const { hppPreview, loading: hppLoading } = useHppPreview(id);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await apiGet('/api/v1/inventory/raw-materials');
        if (data) setMaterials(data as RawMaterial[]);
      } catch (err) {
        console.error('Failed to fetch materials', err);
      } finally {
        setMaterialsLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!id) return;
      try {
        const recipes = await getProductRecipes(id);
        if (recipes && recipes.length > 0) {
          setIngredients(recipes.map((r: ProductRecipe) => ({
            id: r.id,
            raw_material_id: r.raw_material_id,
            name: r.raw_materials?.name || '',
            unit: r.raw_materials?.unit || '',
            unit_price: r.raw_materials?.unit_price || 0,
            quantity_needed: r.quantity_needed,
          })));
        } else if (hppPreview?.ingredients && hppPreview.ingredients.length > 0) {
          setIngredients(hppPreview.ingredients.map((ing: any) => ({
            raw_material_id: ing.raw_material_id || '',
            name: ing.name,
            unit: ing.unit,
            unit_price: ing.unit_price,
            quantity_needed: ing.quantity_needed,
          })));
        }
      } catch (err) {
        console.error('Failed to fetch recipes', err);
      } finally {
        setRecipesLoading(false);
      }
    };
    fetchRecipes();
  }, [id, hppPreview]);

  const handleSaveRecipe = useCallback(async () => {
    setIsSaving(true);
    try {
      // Delete existing recipes first, then re-create
      const existingRecipes = await getProductRecipes(id);
      if (existingRecipes && existingRecipes.length > 0) {
        await Promise.all(existingRecipes.map((r: ProductRecipe) => deleteProductRecipe(id, r.id)));
      }

      // Create new recipes
      const validIngredients = ingredients.filter(ing => ing.raw_material_id && ing.quantity_needed > 0);
      if (validIngredients.length > 0) {
        await Promise.all(validIngredients.map(ing =>
          addProductRecipe(id, {
            raw_material_id: ing.raw_material_id,
            quantity_needed: ing.quantity_needed,
          })
        ));
      }

      toast({ title: 'Resep berhasil disimpan!' });
    } catch (err: any) {
      console.error('Failed to save recipe', err);
      toast({ title: err.message || 'Gagal menyimpan resep', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [id, ingredients]);

  const loading = productLoading || hppLoading || materialsLoading || recipesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-slate-400">
        <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="font-bold text-lg">Produk tidak ditemukan</p>
        <Button variant="link" onClick={() => router.back()} className="mt-2">
          Kembali
        </Button>
      </div>
    );
  }

  const mode = hppPreview?.hpp_mode || 'none';

  const availableMaterials = materials.map((m) => ({
    id: m.id,
    name: m.name,
    unit: m.unit,
    unit_price: m.unit_price,
  }));

  const directHppItems = [{
    name: product.name,
    quantity_needed: 1,
    unit: product.unit || 'pcs',
    unit_price: product.cost_price || 0,
    cost: product.cost_price || 0,
  }];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/tenant/inventory/${id}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {product.name} — Resep
          </h1>
          <p className="text-sm text-slate-500 font-medium">{product.category || 'General'}</p>
        </div>
        <HppModeBadge mode={mode} />
      </div>

      {mode === 'none' && (
        <div className="text-center py-20 text-slate-400">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="font-bold text-lg">Tidak ada data HPP untuk produk ini.</p>
          <p className="text-xs text-slate-400 mt-1">Atur mode HPP melalui pengaturan produk.</p>
          <Button variant="link" onClick={() => router.push(`/tenant/inventory/${id}`)} className="mt-2">
            Kembali ke Produk
          </Button>
        </div>
      )}

      {mode === 'recipe' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-black text-slate-800">Resep / BOM</CardTitle>
              <Button
                size="sm"
                onClick={handleSaveRecipe}
                disabled={isSaving}
                className="h-8 text-xs font-bold"
              >
                {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                Simpan Resep
              </Button>
            </CardHeader>
            <CardContent>
              <RecipeBuilder
                productId={id}
                ingredients={ingredients}
                availableMaterials={availableMaterials}
                onChange={setIngredients}
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <HppPreviewCard
              mode="recipe"
              items={hppPreview?.ingredients || []}
              productName={product.name}
              sellingPrice={product.selling_price}
            />
          </div>
        </div>
      )}

      {mode === 'direct' && (
        <div className="max-w-md">
          <HppPreviewCard
            mode="direct"
            items={directHppItems}
            productName={product.name}
            sellingPrice={product.selling_price}
          />

          <Card className="border-none shadow-sm bg-blue-50/50 rounded-[1.5rem] mt-4">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-2 text-blue-600/60 mb-1">
                <DollarSign className="w-4 h-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">HPP Langsung</p>
              </div>
              <p className="text-2xl font-black text-blue-700">
                Rp {product.cost_price != null ? formatter.format(product.cost_price) : 'N/A'}
              </p>
              <p className="text-[10px] font-bold text-blue-500/60 mt-1 uppercase tracking-widest">
                Biaya ditetapkan langsung tanpa resep
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
