'use client';

import React from 'react';

interface ReceiptProps {
  cart: any[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  tenantName?: string;
  referenceNumber?: string;
}

export function Receipt({ 
  cart, 
  subtotal, 
  taxAmount, 
  discount, 
  total,
  tenantName = "Tetasin POS",
  referenceNumber = `POS-${Date.now()}`
}: ReceiptProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div id="receipt-print" className="hidden print:block p-8 bg-white text-black font-mono text-sm max-w-[300px] mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">{tenantName}</h2>
        <p className="text-xs">Terima kasih atas kunjungan Anda</p>
        <div className="border-b border-dashed my-2"></div>
        <p className="text-xs">No: {referenceNumber}</p>
        <p className="text-xs" suppressHydrationWarning>{new Date().toLocaleString('id-ID')}</p>
      </div>

      <div className="space-y-1 mb-4">
        {cart.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start">
            <div className="flex-grow pr-2">
              <p>{item.name}</p>
              <p className="text-xs">{item.quantity} x {formatCurrency(item.selling_price)}</p>
            </div>
            <p className="whitespace-nowrap">{formatCurrency(item.selling_price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed mb-2"></div>

      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Pajak (11%)</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span>Diskon</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm pt-2">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="text-center mt-6 text-xs italic">
        <p>Simpan struk ini sebagai bukti pembayaran</p>
        <p>Powered by Tetasin AI</p>
      </div>
    </div>
  );
}
