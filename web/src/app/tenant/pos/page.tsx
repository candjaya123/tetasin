'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Loader2,
  Scan,
  Crown,
  Sparkles,
  Zap
} from "lucide-react";
import { Cart } from '@/components/pos/Cart';
import { Receipt } from '@/components/pos/Receipt';

export default function PosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [taxRate, setTaxRate] = useState(0.11);
  const [discount, setDiscount] = useState(0);
  const [lastOrder, setLastOrder] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch tenant info
        const { data: profile } = await supabase
          .from('profiles')
          .select('tenant_id, tenants(name)')
          .eq('id', session.user.id)
          .single();
        
        if (profile) setTenant(profile);

        // Fetch products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .order('name');
        
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching POS data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount - discount;

  const handlePrint = () => {
    window.print();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const payload = {
        entity_id: tenant?.tenant_id,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.selling_price
        })),
        tax_amount: taxAmount,
        discount_amount: discount,
        description: 'Penjualan POS Web Dashboard'
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/sales/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Gagal memproses transaksi');

      const result = await response.json();
      setLastOrder({
        reference: result.journalId || `POS-${Date.now()}`,
        cart: [...cart],
        subtotal,
        taxAmount,
        discount,
        total
      });

      alert('Transaksi Berhasil! 🚀');
      
      // Small delay to ensure state updates before print
      setTimeout(() => {
        handlePrint();
        setCart([]);
        setDiscount(0);
      }, 500);

    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan saat checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm) {
      if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
        setSearchTerm('');
      }
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full max-h-[calc(100vh-140px)] print:hidden">
      {/* Products Area */}
      <div className="flex-grow space-y-6 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Cari nama atau barcode..." 
              className="pl-10 h-11 border-none shadow-sm bg-white focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex items-center gap-3">

            <Button variant="outline" className="bg-white border-none shadow-sm rounded-xl">Kategori</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group bg-white overflow-hidden"
              onClick={() => addToCart(product)}
            >
              <div className="aspect-square bg-slate-100 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                <ShoppingBag className="w-12 h-12 text-slate-300" />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                <div className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
              <CardContent className="p-4">
                <p className="font-semibold text-foreground truncate">{product.name}</p>
                <p className="text-primary font-bold mt-1">{formatCurrency(product.selling_price)}</p>
              </CardContent>
            </Card>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p>Produk tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Area */}
      <Cart 
        cart={cart}
        onUpdateQuantity={(id, delta) => {
          setCart(cart.map(item => {
            if (item.id === id) {
              const newQty = Math.max(1, item.quantity + delta);
              return { ...item, quantity: newQty };
            }
            return item;
          }));
        }}
        onRemove={(id) => setCart(cart.filter(item => item.id !== id))}
        onCheckout={handleCheckout}
        isProcessing={isProcessing}
        taxRate={taxRate}
        discount={discount}
        formatCurrency={formatCurrency}
      />

      {/* Hidden Receipt for Printing */}
      <Receipt 
        cart={lastOrder?.cart || []}
        subtotal={lastOrder?.subtotal || 0}
        taxAmount={lastOrder?.taxAmount || 0}
        discount={lastOrder?.discount || 0}
        total={lastOrder?.total || 0}
        tenantName={tenant?.tenants?.name}
        referenceNumber={lastOrder?.reference}
      />
    </div>
  );
}
