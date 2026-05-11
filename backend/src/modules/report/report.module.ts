import { Module } from '@nestjs/common';
import { ReportController } from './controllers/report/report.controller';
import { ReportService } from './services/report/report.service';
import { AccountingModule } from '../accounting/accounting.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [AccountingModule, InventoryModule],
  controllers: [ReportController],
  providers: [ReportService]
})
export class ReportModule {}
