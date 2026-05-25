import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AutopilotService } from './services/autopilot.service';

@Module({
  imports: [AiModule],
  providers: [AutopilotService],
  exports: [AutopilotService],
})
export class ErpModule {}
