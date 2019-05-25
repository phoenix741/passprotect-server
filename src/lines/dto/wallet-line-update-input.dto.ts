import { InputType, Field, ID } from 'type-graphql';
import { WalletLineCreateInput } from './wallet-line-create-input.dto';
import { ObjectID } from 'bson';

@InputType({ description: 'Wallet line used for update' })
export class WalletLineUpdateInput extends WalletLineCreateInput {
  @Field(type => ObjectID, {
    description: 'Id of the line, if not filled application create a new line',
  })
  _id: ObjectID;
}
