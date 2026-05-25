import { Module } from '@nestjs/common';
import { RecoveryService } from './services/recovery.service';

@Module({
  providers: [RecoveryService],
  exports: [RecoveryService],
})
export class RecoveryModule {}
