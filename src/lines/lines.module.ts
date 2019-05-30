import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LineSchema } from './schemas/line.schema';
import { LinesService } from './lines.service';
import { SharedModule } from '../shared/shared.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [SharedModule, MongooseModule.forFeature([{ name: 'Line', schema: LineSchema }]), TransactionsModule],
  providers: [LinesService],
  exports: [LinesService],
})
export class LinesModule {}
