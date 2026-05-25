import { Module } from '@nestjs/common';
import { OnboardingService } from './services/onboarding.service';
import { OnboardingController } from './controllers/onboarding.controller';
import { SharedModule } from '../../shared/shared.module';
import { AiModule } from '../ai/ai.module';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [SharedModule, AiModule, AccountingModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
