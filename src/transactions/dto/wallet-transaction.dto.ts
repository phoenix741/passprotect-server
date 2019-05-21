import { Field, ObjectType } from 'type-graphql';
import { WalletLine } from '../../lines/dto/wallet-line.dto';
import { TransactionTypeEnum } from '../../shared/interfaces/transaction-type-enum.interface';
import { ObjectID } from 'bson';

@ObjectType({ description: 'Wallet transaction, used to synchronize lines between devices' })
export class WalletTransaction {
  @Field(type => ObjectID, { description: 'Id of the transaction' })
  _id: ObjectID;

  @Field(type => TransactionTypeEnum, { description: 'Type of the object modified (only line)' })
  type: TransactionTypeEnum;

  @Field(type => WalletLine, { description: 'The line before the modification', nullable: true })
  before?: WalletLine;

  @Field(type => WalletLine, { description: 'The line after the modification', nullable: true })
  after?: WalletLine;

  @Field(type => Date, { description: 'The modification date' })
  updatedAt: Date;

  @Field({ description: 'A SHA-512 calculate on the modification.' })
  sha512: string;
}
