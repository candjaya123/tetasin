import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UnitOfWork } from './database/unit-of-work';
import { EventBusService } from './events/event-bus.service';
import { EventProcessor } from './events/event.processor';

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
  providers: [UnitOfWork, EventBusService, EventProcessor],
  exports: [UnitOfWork, EventBusService, EventProcessor, BullModule],
})
export class CoreModule {}
