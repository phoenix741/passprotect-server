import { Model } from 'mongoose';
import { PubSub } from 'apollo-server-express';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TransactionTypeEnum } from '../shared/interfaces/transaction-type-enum.interface';
import { TransactionEntity } from './models/transaction.entity';
import { IFindAllTransactionParams } from './models/transaction.models';
import { LineEntity } from '../lines/models/line.entity';
import { createHash } from 'crypto';
import { ObjectID, Binary } from 'bson';

export const TRANSACTION_ADDED_TOPIC = 'transactionAdded';

@Injectable()
export class TransactionsService {
  public transactionPubSub = new PubSub();

  constructor(
    @InjectModel('Transaction')
    private readonly transactionModel: Model<TransactionEntity>,
  ) {}

  async findAll(userId: string, params: IFindAllTransactionParams = {}): Promise<TransactionEntity[]> {
    const filter: IFindAllTransactionDto = { user: userId };
    if (params.earliest) {
      filter.updatedAt = { $gte: params.earliest };
    }
    return await this.transactionModel
      .find(filter)
      .sort({ updatedAt: 1 })
      .exec();
  }

  async createTransaction(type: TransactionTypeEnum, before?: LineEntity, after?: LineEntity): Promise<TransactionEntity> {
    const base = after || before;
    if (!base) {
      throw new Error('Transaction: before or after should be defined');
    }

    const transaction: ICreateTransactionDto = {
      _id: new ObjectID(),
      type,
      line: base._id,
      user: base.user,
      before,
      after,
      sha512:
        after &&
        createHash('sha512')
          .update(after.encryption.content instanceof Binary ? after.encryption.content.buffer : after.encryption.content)
          .digest('hex'),
    };

    const createdTransaction = await this.transactionModel.create(transaction);
    this.transactionAdded(createdTransaction);
    return createdTransaction;
  }

  /**
   * Publish a new transaction to applications.
   *
   * @param {Object} transaction Transaction object
   */
  private transactionAdded(transaction: TransactionEntity) {
    this.transactionPubSub.publish(TRANSACTION_ADDED_TOPIC, {
      transactionAdded: transaction,
    });
  }
}

interface IFindAllTransactionDto {
  user: string;
  updatedAt?: {
    $gte: Date;
  };
}

interface ICreateTransactionDto {
  _id: ObjectID;
  type: TransactionTypeEnum;
  line: ObjectID;
  user: string;
  before: object;
  after: object;
  sha512: string;
}
