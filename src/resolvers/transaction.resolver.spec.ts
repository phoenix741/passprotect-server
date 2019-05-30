import { TransactionResolver } from './transaction.resolver';
import { PubSub } from 'graphql-subscriptions';
import { UsersService } from '../users/users.service';
import { LinesService } from '../lines/lines.service';
import { AuthorizationService } from '../shared/services/authorization.service';
import { TransactionsService } from '../transactions/transactions.service';
import { Test } from '@nestjs/testing';
import { TransactionEntity } from '../transactions/models/transaction.entity';
import { ObjectID } from 'bson';
import { TransactionTypeEnum } from '../shared/interfaces/transaction-type-enum.interface';
import { UserEntity } from '../users/models/user.entity';
import { LineTypeEnum } from '../shared/interfaces/line-type-enum.interface';
import { LineEntity } from '../lines/models/line.entity';

describe('TransactionResolver', () => {
  let transactionResolver: TransactionResolver;
  let userService;
  let linesService;
  let transactionService;
  let authorizationService;

  const user: UserEntity = ({
    _id: 'username',
  } as any) as UserEntity;
  const line: LineEntity = ({
    _id: 'line',
    user: 'userline',
    type: LineTypeEnum.card,
  } as any) as LineEntity;
  const transaction: TransactionEntity = {
    _id: new ObjectID('5ce934e817517d7fb63cc425'),
    type: TransactionTypeEnum.line,
    line: new ObjectID('5ce934e817517d7fb63cc428'),
    user: 'usertransaction',
    before: {
      _id: new ObjectID('5ce934e817517d7fb63cc428'),
      type: LineTypeEnum.text,
      label: 'before',
    },
    after: {
      _id: new ObjectID('5ce934e817517d7fb63cc428'),
      type: LineTypeEnum.text,
      label: 'after',
    },
    sha512: 'sha512',
    createdAt: new Date('2019-05-25T12:28:24.941Z'),
    updatedAt: new Date('2019-05-25T12:28:24.941Z'),
    toObject() {
      return transaction;
    },
  } as TransactionEntity;
  const transactionSameUser = Object.assign({}, transaction, {
    user: 'username',
  });

  beforeEach(async () => {
    userService = {
      findById: jest.fn(),
    };
    linesService = {
      findById: jest.fn(),
    };
    authorizationService = {
      checkPermission: jest.fn(),
    };
    transactionService = {
      findAll: jest.fn(),
      transactionPubSub: new PubSub(),
    };

    const module = await Test.createTestingModule({
      providers: [
        TransactionResolver,
        {
          provide: UsersService,
          useValue: userService,
        },
        {
          provide: LinesService,
          useValue: linesService,
        },
        {
          provide: TransactionsService,
          useValue: transactionService,
        },
        {
          provide: AuthorizationService,
          useValue: authorizationService,
        },
      ],
    }).compile();

    transactionResolver = module.get<TransactionResolver>(TransactionResolver);
  });

  describe('transactions', () => {
    it('success', async () => {
      transactionService.findAll.mockImplementation(() => [transaction]);
      expect(await transactionResolver.transactions(new Date('2019-05-25T12:28:24.941Z'), user)).toMatchSnapshot();
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user);
      expect(transactionService.findAll).toHaveBeenCalledWith('username', {
        earliest: new Date('2019-05-25T12:28:24.941Z'),
      });
    });
  });

  describe('user', () => {
    it('success', async () => {
      userService.findById.mockImplementation(() => user);
      expect(await transactionResolver.user(transaction, user)).toMatchSnapshot();
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user, 'usertransaction');
      expect(userService.findById).toHaveBeenCalledWith('usertransaction');
    });
  });

  describe('line', () => {
    it('success', async () => {
      linesService.findById.mockImplementation(() => line);
      expect(await transactionResolver.line(transaction, user)).toMatchSnapshot();
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user, 'usertransaction');
      expect(linesService.findById).toHaveBeenCalledWith(new ObjectID('5ce934e817517d7fb63cc428'));
    });
  });

  describe('transactionAdded', () => {
    it('publish with one element filtered and another one not filtered', async () => {
      /*
      const metadata = Reflect.getMetadata('graphql:subscription_options;', transactionResolver.transactionAdded);
      const filterFunction = metadata.filter;
      */
      const nextElement = transactionResolver.transactionAdded(user).next();
      transactionService.transactionPubSub.publish('transactionAdded', {
        transactionAdded: transaction,
      });
      transactionService.transactionPubSub.publish('transactionAdded', {
        transactionAdded: transactionSameUser,
      });
      expect(await nextElement).toMatchSnapshot();
    });
  });
});
