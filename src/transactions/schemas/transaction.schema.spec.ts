import * as mongoose from 'mongoose';
import { TransactionSchema } from './transaction.schema';
import { TransactionEntity } from '../models/transaction.entity';
import { TransactionTypeEnum } from '../../shared/interfaces/transaction-type-enum.interface';

describe('TransactionSchema', () => {
  let TransactionModel: mongoose.Model<TransactionEntity>;

  beforeEach(() => {
    TransactionModel = mongoose.model('Transaction', TransactionSchema);
  });

  describe('validation', () => {
    it('should not create a transaction - field required', async () => {
      expect.assertions(1);
      const line = new TransactionModel();
      try {
        await line.validate();
      } catch (err) {
        expect(Object.keys(err.errors)).toEqual(['sha512', 'user', 'type']);
      }
    });

    it('should create a transaction - all field fill', async () => {
      const line = new TransactionModel({
        type: TransactionTypeEnum.line,
        user: 'toto',
        sha512: 'a044bb3c3b775b47952c980c389d23e71ac48b1958555b444eb7c8eee5dcba0268490cd63db4240fd45dace78e66e2b63d612d31d4f6531e14000cfe853796e2',
      });

      await line.validate();
    });
  });
});
