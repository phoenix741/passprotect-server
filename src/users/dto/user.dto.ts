import { Field, ObjectType, ID } from 'type-graphql';
import { EncryptedBlock } from '../../shared/dto/encrypted-block.dto';
import { WalletLine } from '../../lines/dto/wallet-line.dto';

@ObjectType({ description: 'User defined in the application' })
export class User {
  @Field(type => ID, { description: 'Login of the user' })
  _id: string;

  @Field(type => EncryptedBlock, { description: 'Encrypted master key' })
  encryption: EncryptedBlock;

  @Field(type => Date, {
    description: 'Creation date of the user',
    nullable: true,
  })
  createdAt?: Date;

  @Field(type => [WalletLine], {
    description: 'Wallet lines of the user.',
    nullable: true,
  })
  lines?: WalletLine[];
}
