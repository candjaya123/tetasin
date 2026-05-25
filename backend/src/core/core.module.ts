import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';
import { UnitOfWork } from './database/unit-of-work';
import { EventBusService } from './events/event-bus.service';
import { EventProcessor } from './events/event.processor';
import { TierGuard } from './auth/tier.guard';
import { SupabaseService } from '../shared/supabase.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'event-processor-queue',
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      },
    }),
  ],
  providers: [
    UnitOfWork,
    EventBusService,
    EventProcessor,
    SupabaseService,
    TierGuard,
    {
      provide: APP_GUARD,
      useClass: TierGuard,
    },
  ],
  exports: [UnitOfWork, EventBusService, EventProcessor, BullModule, TierGuard, SupabaseService],
})
export class CoreModule {}
