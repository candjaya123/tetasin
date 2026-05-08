import { Module } from '@nestjs/common';
import { ReportController } from './controllers/report/report.controller';
import { ReportService } from './services/report/report.service';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [AccountingModule],
  controllers: [ReportController],
  providers: [ReportService]
})
export class ReportModule {}
