import { TransactionResolver } from './transaction.resolver';
import { PubSub } from 'graphql-subscriptions';
import { UsersService } from 'src/users/users.service';
import { LinesService } from 'src/lines/lines.service';
import { AuthorizationService } from 'src/shared/services/authorization.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Test } from '@nestjs/testing';
import { TransactionEntity } from 'src/transactions/models/transaction.entity';
import { ObjectID } from 'bson';
import { TransactionTypeEnum } from 'src/shared/interfaces/transaction-type-enum.interface';
import { UserEntity } from 'src/users/models/user.entity';
import { LineTypeEnum } from 'src/shared/interfaces/line-type-enum.interface';

describe('TransactionResolver', () => {
  let transactionResolver: TransactionResolver;
  let userService;
  let linesService;
  let transactionService;
  let authorizationService;

  const user: UserEntity = {
    _id: 'username',
  } as any as UserEntity;
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
    })
    .compile();

    transactionResolver = module.get<TransactionResolver>(TransactionResolver);
  });

  describe('transactions', () => {
    it('success', async () => {
      transactionService.findAll.mockImplementation(() => [transaction]);
      expect(await transactionResolver.transactions(new Date('2019-05-25T12:28:24.941Z'), user)).toMatchSnapshot();
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user);
      expect(transactionService.findAll).toHaveBeenCalledWith('username', {earliest: new Date('2019-05-25T12:28:24.941Z')});
    });
  });
});
