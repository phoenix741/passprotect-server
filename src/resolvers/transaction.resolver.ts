import { UseGuards } from '@nestjs/common';
import { TransactionsService, TRANSACTION_ADDED_TOPIC } from '../transactions/transactions.service';
import { AuthorizationService } from '../shared/services/authorization.service';
import { Args, Subscription, Resolver, ResolveProperty, Parent, Query } from '@nestjs/graphql';
import { GqlAuthGuard } from '../session/guard/gql-auth.guard';
import { UserEntity } from '../users/models/user.entity';
import { TransactionEntity } from '../transactions/models/transaction.entity';
import { UsersService } from '../users/users.service';
import { WalletTransaction } from '../transactions/dto/wallet-transaction.dto';
import { exposeWalletLine } from './line.resolver';
import { User as UserDto } from '../users/dto/user.dto';
import { LineEntity } from '../lines/models/line.entity';
import { WalletLine } from '../lines/dto/wallet-line.dto';
import { LinesService } from '../lines/lines.service';
import { ObjectID } from 'bson';
import { UserContext } from '../session/guard/user-context.decorator';
import { $$asyncIterator } from 'iterall';

@Resolver(of => WalletTransaction)
@UseGuards(GqlAuthGuard)
export class TransactionResolver {
  constructor(
    private readonly userService: UsersService,
    private readonly lineService: LinesService,
    private readonly transactionService: TransactionsService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  @Query(returns => [WalletTransaction], { description: 'Request all transactions that happen since the last synchronisation date.' })
  async transactions(@Args('earliest') earliest: Date, @UserContext() user: UserEntity): Promise<WalletTransaction[]> {
    this.authorizationService.checkPermission(user);

    return (await this.transactionService.findAll(user._id, { earliest })).map(exposeWalletTransaction);
  }

  @Subscription(returns => WalletTransaction, {
    name: 'transactionAdded',
    description: 'Stream of update to wallet line',
  })
  transactionAdded(@UserContext() user: UserEntity): AsyncIterator<WalletTransaction> {
    return asyncFilter(
      this.transactionService.transactionPubSub.asyncIterator(TRANSACTION_ADDED_TOPIC),
      payload => {
        return (payload as any).transactionAdded.user === user._id;
      },
    );
    return ;
  }

  @ResolveProperty('user', returns => UserDto, { description: 'Owner of the transaction' })
  async user(@Parent() transaction: TransactionEntity, @UserContext() user: UserEntity): Promise<UserDto> {
    this.authorizationService.checkPermission(user, transaction.user);
    return await this.userService.findById(transaction.user);
  }

  @ResolveProperty('line', returns => WalletLine, { description: 'Request a wallet line' })
  async line(@Parent() transaction: TransactionEntity, @UserContext() user: UserEntity): Promise<WalletLine> {
    this.authorizationService.checkPermission(user);
    return exposeWalletLine(await this.lineService.findById(new ObjectID(transaction.line)));
  }
}

function exposeWalletTransaction(transaction: TransactionEntity): WalletTransaction {
  return Object.assign(
    {},
    transaction.toObject(),
    {
      _id: transaction._id,
      type: transaction.type.toString(),
      before: transaction.before && exposeWalletLine(transaction.before as LineEntity),
      after: transaction.after && exposeWalletLine(transaction.after as LineEntity),
    },
  );
}

export type FilterFn<T> = (rootValue?: T) => boolean | Promise<boolean>;

export const asyncFilter = <T = any>(asyncIterator: AsyncIterator<T>, filterFn: FilterFn<T>): AsyncIterator<T> => {
    const getNextPromise = () => {
        return asyncIterator.next().then(payload => {
            if (payload.done === true) {
                return payload;
            }

            return Promise.resolve(filterFn(payload.value))
                .catch(() => false)
                .then(filterResult => {
                    if (filterResult === true) {
                        return payload;
                    }

                    // Skip the current value and wait for the next one
                    return getNextPromise();
                });
        });
    };

    return {
        next() {
            return getNextPromise();
        },
        return() {
            return asyncIterator.return();
        },
        throw(error) {
            return asyncIterator.throw(error);
        },
        [$$asyncIterator]() {
            return this;
        },
    };
};
