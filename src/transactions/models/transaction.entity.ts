import { Document } from 'mongoose';
import { ObjectID } from 'bson';
import { TransactionTypeEnum } from '../../shared/interfaces/transaction-type-enum.interface';

export interface TransactionEntity extends Document {
  _id: ObjectID;
  type: TransactionTypeEnum;
  line: ObjectID;
  user: string;
  before?: object;
  after?: object;
  sha512: string;
  createdAt: Date;
  updatedAt: Date;
}
