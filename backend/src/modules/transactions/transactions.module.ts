import { Module } from '@nestjs/common';
import { TransactionsController } from './controllers/transactions.controller';

@Module({
  controllers: [TransactionsController],
})
export class TransactionsModule {}
