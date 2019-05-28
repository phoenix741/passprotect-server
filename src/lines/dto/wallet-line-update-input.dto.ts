import { InputType, Field } from 'type-graphql';
import { ObjectID } from 'bson';
import { LineTypeEnum } from '../../shared/interfaces/line-type-enum.interface';
import { EncryptedBlockInput } from '../../shared/dto/encrypted-block-input.dto';

@InputType({ description: 'Wallet line used for update' })
export class WalletLineUpdateInput {
  @Field(type => ObjectID, {
    description: 'Id of the line, if not filled application create a new line',
    nullable: true,
  })
  _id: ObjectID;

  @Field(type => LineTypeEnum, {
    description: 'Type of the line (text, password, card)',
    nullable: true,
  })
  type?: LineTypeEnum;

  @Field({ description: 'Label of the wallet line', nullable: true })
  label?: string;

  @Field({ description: 'Group of the wallet line', nullable: true })
  group?: string;

  @Field({ description: 'Logo of the line', nullable: true })
  logo?: string;

  @Field(type => EncryptedBlockInput, {
    description: 'Encrypted content of the line (encrypted client side)',
    nullable: true,
  })
  encryption?: EncryptedBlockInput;
}
