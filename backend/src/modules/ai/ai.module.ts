import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiProcessor } from './ai.processor';
import { GeminiProvider } from '../../core/ai/gemini.provider';
import { AiRuleEnforcementService } from '../../core/ai/ai-rule-enforcement.service';
import { AggregatorService } from './services/aggregator.service';
import { MemoryService } from './services/memory.service';
import { ForecastingService } from './services/forecasting.service';
import { AiController } from './controllers/ai.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-ocr-queue',
    }),
  ],
  controllers: [AiController],
  providers: [
    AiProcessor, 
    GeminiProvider, 
    AiRuleEnforcementService,
    AggregatorService,
    MemoryService,
    ForecastingService
  ],
  exports: [
    BullModule, 
    GeminiProvider, 
    AiRuleEnforcementService,
    AggregatorService,
    MemoryService,
    ForecastingService
  ],
})
export class AiModule {}
