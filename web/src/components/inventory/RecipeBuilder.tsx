'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Calculator } from "lucide-react";

interface IngredientRow {
  raw_material_id: string;
  name: string;
  unit: string;
  unit_price: number;
  quantity_needed: number;
}

interface RawMaterialOption {
  id: string;
  name: string;
  unit: string;
  unit_price: number;
}

interface RecipeBuilderProps {
  productId: string;
  ingredients: IngredientRow[];
  availableMaterials: RawMaterialOption[];
  onChange: (ingredients: IngredientRow[]) => void;
}

const formatter = new Intl.NumberFormat('id-ID');

export function RecipeBuilder({ productId, ingredients, availableMaterials, onChange }: RecipeBuilderProps) {
  const handleAdd = () => {
    onChange([...ingredients, { raw_material_id: '', name: '', unit: '', unit_price: 0, quantity_needed: 0 }]);
  };

  const handleRemove = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, materialId: string) => {
    const updated = [...ingredients];
    const material = availableMaterials.find((m) => m.id === materialId);
    updated[index] = {
      ...updated[index],
      raw_material_id: materialId,
      name: material?.name || '',
      unit: material?.unit || '',
      unit_price: material?.unit_price || 0,
    };
    onChange(updated);
  };

  const handleQuantityChange = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = {
      ...updated[index],
      quantity_needed: parseFloat(value) || 0,
    };
    onChange(updated);
  };

  const totalHpp = ingredients.reduce((sum, ing) => {
    return sum + (ing.unit_price * ing.quantity_needed);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Resep / BOM</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs font-bold text-primary hover:text-primary/80"
          onClick={handleAdd}
        >
          <Plus className="w-3 h-3 mr-1" />
          Tambah Bahan
        </Button>
      </div>

      {ingredients.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-4 text-center border border-dashed border-slate-200">
          <Calculator className="w-5 h-5 text-slate-300 mx-auto mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Belum Ada Resep</p>
          <p className="text-[9px] text-slate-400">Klik &quot;Tambah Bahan&quot; untuk menambahkan bahan baku ke dalam resep.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ingredients.map((ing, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                className="flex-grow h-10 bg-slate-50 border-none rounded-xl text-xs font-bold px-3 focus:ring-2 focus:ring-primary outline-none"
                value={ing.raw_material_id}
                onChange={(e) => handleUpdate(index, e.target.value)}
              >
                <option value="">Pilih Bahan...</option>
                {availableMaterials.map((rm) => (
                  <option key={rm.id} value={rm.id}>{rm.name} ({rm.unit})</option>
                ))}
              </select>
              <div className="relative w-28">
                <Input
                  type="number"
                  placeholder="Qty"
                  className="h-10 bg-slate-50 border-none rounded-xl font-bold text-xs pr-16"
                  value={ing.quantity_needed || ''}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 pointer-events-none">
                  / 1 unit
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-slate-300 hover:text-red-500 flex-shrink-0"
                onClick={() => handleRemove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {ingredients.length > 0 && (
        <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm font-black text-slate-600">Total HPP per Unit</span>
          <span className="text-lg font-black text-primary">
            Rp {formatter.format(totalHpp)}
          </span>
        </div>
      )}
    </div>
  );
}
