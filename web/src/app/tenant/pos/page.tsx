'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { profileService } from '@/lib/api/profileService';
import { productService } from '@/lib/api/productService';
import { processSale } from '@/lib/api/salesService';
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
  Zap,
  ArrowRight
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
  const [activeMobileTab, setActiveMobileTab] = useState<'products' | 'cart'>('products');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await profileService.getProfile();
        if (profile) setTenant(profile);

        const productsData = await productService.getProducts();
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching POS data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      const idempotencyKey = `web-pos-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const payload = {
        entity_id: tenant?.tenant_id,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.selling_price,
          discount: item.discount || 0,
        })),
        tax_amount: taxAmount,
        discount_amount: discount,
        payment_method: 'cash',
        description: 'Penjualan POS Web Dashboard',
        idempotency_key: idempotencyKey,
        total: subtotal + taxAmount - discount,
      };

      // Frontend total validation (matches backend logic)
      const calculatedTotal = payload.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity) - (item.discount || 0), 0) + taxAmount - discount;
      if (Math.abs(calculatedTotal - payload.total) >= 1.0) {
        console.warn('Total mismatch detected:', { calculatedTotal, frontendTotal: payload.total });
      }

      const result = await processSale(payload);
      setLastOrder({
        reference: result.order_number || result.pesananNumber || `POS-${Date.now()}`,
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
      if (error?.response?.data?.code === 'TRANSACTION_LIMIT') {
        alert(error.response.data.message || 'Batas transaksi tercapai. Upgrade ke Pro.');
      } else {
        alert(error.message || 'Terjadi kesalahan saat checkout');
      }
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
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full max-h-[calc(100vh-140px)] print:hidden relative overflow-hidden">
      {/* Mobile/Tablet Tabs (Hidden on Desktop) */}
      <div className="flex lg:hidden p-1 bg-slate-100 dark:bg-slate-900 rounded-xl shrink-0 w-full">
        <button
          onClick={() => setActiveMobileTab('products')}
          className={`flex-grow py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeMobileTab === 'products'
              ? 'bg-white dark:bg-card text-slate-800 dark:text-foreground shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Daftar Produk
        </button>
        <button
          onClick={() => setActiveMobileTab('cart')}
          className={`flex-grow py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeMobileTab === 'cart'
              ? 'bg-white dark:bg-card text-slate-800 dark:text-foreground shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Keranjang
          {cart.length > 0 && (
            <span className="w-5 h-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-black animate-scale-in">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Products Area */}
      <div className={`flex-grow space-y-6 overflow-hidden flex flex-col ${activeMobileTab === 'products' ? 'flex' : 'hidden lg:flex'}`}>
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

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-16 lg:pb-4">
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
      <div className={`w-full lg:w-auto ${activeMobileTab === 'cart' ? 'block' : 'hidden lg:block'} shrink-0 overflow-y-auto max-h-full pb-6 lg:pb-0`}>
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
      </div>

      {/* Floating Cart Button for Mobile (Only visible on Products tab when cart has items) */}
      {activeMobileTab === 'products' && cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden animate-reveal-up">
          <Button 
            onClick={() => setActiveMobileTab('cart')}
            className="w-full h-14 bg-primary text-primary-foreground font-black rounded-xl shadow-xl flex items-center justify-between px-6 active:scale-[0.98] transition-all"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>{cart.length} Item</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>Tinjau Pesanan</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </Button>
        </div>
      )}

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
