import { Field, ObjectType, ID, Int } from 'type-graphql';
import { EncryptedBlock } from '../../shared/dto/encrypted-block.dto';
import { LineTypeEnum } from '../../shared/interfaces/line-type-enum.interface';
import { ObjectID } from 'bson';

@ObjectType({ description: 'Wallet' })
export class WalletLine {
  @Field(type => ObjectID, { description: 'Id of the line' })
  _id: ObjectID;

  @Field(type => LineTypeEnum, { description: 'Type of the line (text, password, card)' })
  type: LineTypeEnum;

  @Field({ description: 'Label of the wallet line' })
  label: string;

  @Field({ description: 'Group of the wallet line', nullable: true })
  group?: string;

  @Field(type => Buffer, { description: 'Logo of the line', nullable: true })
  logo?: Buffer;

  @Field(type => EncryptedBlock, { description: 'Encrypted content of the line (encrypted client side)' })
  encryption: EncryptedBlock;

  @Field(type => Date, { description: 'Created date of the line', nullable: true })
  createdAt?: Date;

  @Field(type => Date, { description: 'Last updated date of the line', nullable: true })
  updatedAt?: Date;

  @Field(type => Int, { description: 'Revision (modification count) of the line' })
  _rev?: number;
}
