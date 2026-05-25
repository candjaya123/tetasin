'use client';

import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';

interface Account {
  name: string;
  code: string;
  amount: string;
}

interface Category {
  title: string;
  total: string;
  accounts: Account[];
  color?: string;
}

interface ReportTreeTableProps {
  data: Category[];
  netTitle?: string;
  netValue?: string;
}

export const ReportTreeTable: React.FC<ReportTreeTableProps> = ({ data, netTitle, netValue }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    data.reduce((acc, cat) => ({ ...acc, [cat.title]: true }), {})
  );

  const toggle = (title: string) => {
    setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="w-full bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <th className="px-8 py-5">Keterangan / Akun</th>
            <th className="px-8 py-5 text-right">Saldo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((category) => (
            <React.Fragment key={category.title}>
              <tr 
                className="hover:bg-slate-50/30 transition-colors cursor-pointer group"
                onClick={() => toggle(category.title)}
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${expanded[category.title] ? 'bg-slate-100 text-slate-600' : 'bg-primary/10 text-primary'}`}>
                      {expanded[category.title] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-black text-secondary tracking-tight uppercase">{category.title}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className={`text-sm font-black ${category.color || 'text-secondary'}`}>
                    {formatCurrency(category.total)}
                  </span>
                </td>
              </tr>
              {expanded[category.title] && category.accounts.map((acc) => (
                <tr key={acc.code} className="bg-slate-50/10 hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 pl-20">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-600">{acc.name}</span>
                        <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">{acc.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <span className="text-sm font-bold text-slate-500">
                      {formatCurrency(acc.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}

          {netTitle && (
            <tr className="bg-secondary text-white border-t-2 border-primary">
              <td className="px-8 py-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-secondary shadow-lg shadow-primary/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-black tracking-tight">{netTitle}</span>
                </div>
              </td>
              <td className="px-8 py-8 text-right">
                <span className="text-2xl font-black tracking-tight">
                  {formatCurrency(netValue || '0')}
                </span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
