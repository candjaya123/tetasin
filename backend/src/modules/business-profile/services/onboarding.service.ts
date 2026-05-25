import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class OnboardingService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createProfile(entityId: string, type: 'jasa' | 'retail') {
    const client = this.supabaseService.getClient();

    const coaTemplates = {
      jasa: [
        { code: '1-1001', name: 'Kas Utama', type: 'aset', kategori: 'ASET', normal_balance: 'debit' },
        { code: '4-1001', name: 'Pendapatan Jasa', type: 'pendapatan', kategori: 'PENDAPATAN', normal_balance: 'credit' },
        { code: '5-1001', name: 'Beban Operasional', type: 'beban', kategori: 'BEBAN OPERASIONAL', normal_balance: 'debit' },
      ],
      retail: [
        { code: '1-1001', name: 'Kas Utama', type: 'aset', kategori: 'ASET', normal_balance: 'debit' },
        { code: '1-2001', name: 'Persediaan Barang Dagang', type: 'aset', kategori: 'ASET', normal_balance: 'debit' },
        { code: '4-1001', name: 'Pendapatan Penjualan', type: 'pendapatan', kategori: 'PENDAPATAN', normal_balance: 'credit' },
        { code: '5-1001', name: 'Beban HPP', type: 'beban', kategori: 'HPP / BIAYA LANGSUNG', normal_balance: 'debit' },
      ],
    };

    const accountsToInsert = coaTemplates[type].map((acc) => ({
      ...acc,
      entity_id: entityId,
      tenant_id: entityId, // Assuming tenant_id is the same as entityId for now in this refactor
    }));

    const { data, error } = await client.from('accounts').insert(accountsToInsert);

    if (error) {
      throw new Error(`Failed to create COA for ${type}: ${error.message}`);
    }

    return data;
  }
}
