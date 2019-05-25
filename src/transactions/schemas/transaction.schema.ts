import * as mongoose from 'mongoose';
import { TransactionEntity } from '../../transactions/models/transaction.entity';

export const TransactionSchema = new mongoose.Schema<TransactionEntity>(
  {
    _id: mongoose.Schema.Types.ObjectId,
    type: { type: String, required: true, enum: ['line'] },
    line: mongoose.Schema.Types.ObjectId,
    user: { type: String, required: true },
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    sha512: { type: String, required: true },
  },
  { timestamps: true },
);
