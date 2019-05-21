import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionSchema } from './schemas/transaction.schema';
import { TransactionsService } from './transactions.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: 'Transaction', schema: TransactionSchema }]),
  ],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
