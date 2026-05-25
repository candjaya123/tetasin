import { Module } from '@nestjs/common';
import { BillTrackerController } from './controllers/bill-tracker.controller';
import { BillTrackerService } from './services/bill-tracker.service';
import { BillReminderCronService } from './services/bill-reminder-cron.service';

@Module({
  controllers: [BillTrackerController],
  providers: [BillTrackerService, BillReminderCronService],
  exports: [BillTrackerService],
})
export class BillTrackerModule {}
