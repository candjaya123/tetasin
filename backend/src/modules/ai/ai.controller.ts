import { Controller, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { GeminiProvider } from '../../core/ai/gemini.provider';
import { ForecastingService } from './services/forecasting.service';
import { JwtAuthGuard } from '../business-profile/guards/jwt-auth.guard';
import { SupabaseService } from '../../shared/supabase.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/v1/ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly gemini: GeminiProvider,
    private readonly forecastingService: ForecastingService,
    private readonly supabaseService: SupabaseService,
  ) { }

  @Post('business/chat')
  async businessChat(@Body() body: { prompt: string }, @Request() req: any) {
    const { prompt } = body;
    const tenantId = req.user.tenant_id;

    try {
      const systemContext = `Anda adalah CFO Virtual (Tumbuhin AI). 
      Berikan jawaban profesional mengenai keuangan dan operasional bisnis berdasarkan pertanyaan user.
      Gunakan Bahasa Indonesia yang mudah dipahami.`;

      const fullPrompt = `${systemContext}\n\nUser: ${prompt || 'Berikan insight singkat tentang keuangan bisnis saya.'}`;
      const response = await this.gemini.generateContent(fullPrompt);
      return { response };
    } catch (e: any) {
      if (e?.message === 'AI_RATE_LIMIT' || e?.message?.includes('quota') || e?.message?.includes('429')) {
        throw new HttpException(
          'Kuota AI sedang tinggi. Mohon tunggu beberapa menit dan coba lagi.',
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
      throw new InternalServerErrorException(`AI Error: ${e?.message}`);
    }
  }

  @Post('personal/chat')
  async personalChat(@Body() body: { prompt: string }, @Request() req: any) {
    const { prompt } = body;
    const tenantId = req.user.tenant_id;

    try {
      const systemContext = `Anda adalah Asisten Perencana Keuangan Pribadi yang jujur, suportif, dan edukatif. 
      Misi Anda adalah membantu user mengatur uang agar tidak boros. 
      Gunakan data anggaran dan pengeluaran yang diberikan untuk menjawab pertanyaan user secara spesifik.`;
      
      let dataContext = '';
      try {
        const client = this.supabaseService.getClient();
        const month = new Date().toISOString().slice(0, 7);
        const { data: budgets } = await client
          .from('budgets')
          .select('*, chart_of_accounts(name)')
          .eq('tenant_id', tenantId)
          .eq('period_month', month);

        if (budgets && budgets.length > 0) {
          const start = `${month}-01`;
          const end = `${month}-31`;
          
          const budgetDetails = await Promise.all(budgets.map(async (b: any) => {
            const { data: lines } = await client
              .from('journal_lines')
              .select('debit, journal_entries!inner(date)')
              .eq('account_id', b.account_id)
              .eq('journal_entries.tenant_id', tenantId)
              .gte('journal_entries.date', start)
              .lte('journal_entries.date', end);
            
            const spent = (lines || []).reduce((s: number, l: any) => s + (Number(l.debit) || 0), 0) || 0;
            return `- ${b.chart_of_accounts?.name}: Terpakai Rp ${spent.toLocaleString()} dari Rp ${Number(b.limit_amount).toLocaleString()}`;
          }));

          dataContext = `\n[KONTEKS DATA USER BULAN INI]:\n${budgetDetails.join('\n')}\n`;
        }
      } catch (e) {
        console.error('Failed to fetch AI budget context:', e);
      }

      const fullPrompt = `${systemContext}${dataContext}\n\nUser: ${prompt || 'Berikan insight singkat tentang keuangan saya.'}`;
      const response = await this.gemini.generateContent(fullPrompt);
      return { response };
    } catch (e: any) {
      if (e?.message === 'AI_RATE_LIMIT' || e?.message?.includes('quota') || e?.message?.includes('429')) {
        throw new HttpException(
          'Kuota AI sedang tinggi. Mohon tunggu beberapa menit dan coba lagi.',
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
      throw new InternalServerErrorException(`AI Error: ${e?.message}`);
    }
  }
}
