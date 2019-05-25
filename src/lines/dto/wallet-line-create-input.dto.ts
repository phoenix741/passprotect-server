import { InputType, Field, ID } from 'type-graphql';
import { EncryptedBlockInput } from '../../shared/dto/encrypted-block-input.dto';
import { LineTypeEnum } from '../../shared/interfaces/line-type-enum.interface';

@InputType({ description: 'Wallet line used for creation' })
export class WalletLineCreateInput {
  @Field(type => LineTypeEnum, {
    description: 'Type of the line (text, password, card)',
  })
  type: LineTypeEnum;

  @Field({ description: 'Label of the wallet line' })
  label: string;

  @Field({ description: 'Group of the wallet line' })
  group: string;

  @Field({ description: 'Logo of the line', nullable: true })
  logo?: string;

  @Field(type => EncryptedBlockInput, {
    description: 'Encrypted content of the line (encrypted client side)',
  })
  encryption: EncryptedBlockInput;
}
