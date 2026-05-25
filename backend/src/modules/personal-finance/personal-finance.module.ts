import { Module } from '@nestjs/common';
import { PersonalEntryController } from './controllers/personal-entry.controller';
import { PersonalSummaryController } from './controllers/personal-summary.controller';
import { PersonalBudgetController } from './controllers/personal-budget.controller';
import { PersonalGoalController } from './controllers/personal-goal.controller';
import { RecurringController } from './controllers/recurring.controller';
import { PersonalFinanceService } from './services/personal-finance.service';

@Module({
  controllers: [
    PersonalEntryController,
    PersonalSummaryController,
    PersonalBudgetController,
    PersonalGoalController,
    RecurringController,
  ],
  providers: [PersonalFinanceService],
  exports: [PersonalFinanceService],
})
export class PersonalFinanceModule {}
