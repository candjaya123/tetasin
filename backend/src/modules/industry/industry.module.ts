import { Module } from '@nestjs/common';
import { IndustryController } from './controllers/industry.controller';
import { IndustryService } from './services/industry.service';

@Module({
  controllers: [IndustryController],
  providers: [IndustryService],
  exports: [IndustryService],
})
export class IndustryModule {}
