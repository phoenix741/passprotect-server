import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import mockingoose from 'mockingoose';
import { TransactionSchema } from './schemas/transaction.schema';
import {
  TransactionsService,
  TRANSACTION_ADDED_TOPIC,
} from './transactions.service';
import { ObjectID } from 'bson';
import { TransactionTypeEnum } from '../shared/interfaces/transaction-type-enum.interface';
import { LineEntity } from '../lines/models/line.entity';
import { LineTypeEnum } from '../shared/interfaces/line-type-enum.interface';
import { TransactionEntity } from './models/transaction.entity';

describe('TransactionsService', () => {
  let transactionModel;
  let transactionsService;

  const line: LineEntity = {
    _id: new ObjectID('5ce15929f02fc23595ec38f1'),
    type: LineTypeEnum.card,
    label: 'Mon label',
    group: 'Mon group',
    encryption: {
      authTag: Buffer.from('authTag'),
      content: Buffer.from('content'),
      iv: Buffer.from('iv'),
      salt: Buffer.from('salt'),
    },
    user: 'userId',
    createdAt: new Date(1558224000),
    updatedAt: new Date(1558224000),
  } as LineEntity;

  const transaction: TransactionEntity = {
    _id: new ObjectID('5ce15929f02fc23595ec38f0'),
    type: TransactionTypeEnum.line,
    line: new ObjectID('5ce15929f02fc23595ec38f1'),
    user: 'userId',
    before: null,
    after: line,
    sha512: 'sha512',
    createdAt: new Date(1558224000),
    updatedAt: new Date(1558224000),
  } as TransactionEntity;

  beforeEach(async () => {
    transactionModel = mongoose.model('Transaction', TransactionSchema);

    const module = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getModelToken('Transaction'),
          useValue: transactionModel,
        },
      ],
    }).compile();

    transactionsService = module.get<TransactionsService>(TransactionsService);
  });

  describe('findAll', () => {
    const doc = {
      _id: new ObjectID('5ce15929f02fc23595ec38f0'),
      type: TransactionTypeEnum.line,
      line: new ObjectID('5ce15929f02fc23595ec38f1'),
      user: 'userId',
      sha512: 'sha512',
      createdAt: new Date(1558224000),
      updatedAt: new Date(1558224000),
    };

    it('without date', async () => {
      const userId = 'userId';
      const finderMock = query => {
        expect(query.getQuery()).toMatchSnapshot('find query without date');
        return [doc];
      };
      mockingoose(transactionModel).toReturn(finderMock, 'find');
      const lines = await transactionsService.findAll(userId);
      expect(lines.map(line => line.toObject())).toMatchSnapshot(
        'result of find all without date',
      );
    });

    it('with date', async () => {
      const userId = 'userId';
      const finderMock = query => {
        expect(query.getQuery()).toMatchSnapshot('find query without date');
        return [doc];
      };
      mockingoose(transactionModel).toReturn(finderMock, 'find');
      const lines = await transactionsService.findAll(userId, {
        earliest: new Date(1558224000),
      });
      expect(lines.map(line => line.toObject())).toMatchSnapshot(
        'result of find all with date',
      );
    });
  });

  describe('createTransaction', () => {
    it('success', async () => {
      const createMock = transactionToCreate => {
        expect(transactionToCreate.toObject()).toMatchSnapshot(
          {
            _id: expect.any(ObjectID),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
          'transaction to create',
        );
        return transaction;
      };
      mockingoose(transactionModel).toReturn(createMock, 'save');
      const createdTransaction = await transactionsService.createTransaction(
        TransactionTypeEnum.line,
        null,
        line,
      );
      expect(createdTransaction.toObject()).toMatchSnapshot(
        'transaction created',
      );
    });

    it('failed', async () => {
      mockingoose(transactionModel).toReturn(new Error('failed'), 'save');
      await expect(
        transactionsService.createTransaction(
          TransactionTypeEnum.line,
          null,
          line,
        ),
      ).rejects.toThrow('failed');
    });

    it('failed - no line', async () => {
      await expect(
        transactionsService.createTransaction(
          TransactionTypeEnum.line,
          null,
          null,
        ),
      ).rejects.toThrow('Transaction: before or after should be defined');
    });
  });

  describe('transactionPubSub', () => {
    it('publish', async done => {
      mockingoose(transactionModel).toReturn(transaction, 'save');
      const unsubscribeId = await transactionsService.transactionPubSub.subscribe(
        TRANSACTION_ADDED_TOPIC,
        t => {
          expect(t).toMatchSnapshot('result of published transaction');
          transactionsService.transactionPubSub.unsubscribe(unsubscribeId);
          done();
        },
      );
      transactionsService.createTransaction(
        TransactionTypeEnum.line,
        null,
        line,
      );
    });
  });
});
