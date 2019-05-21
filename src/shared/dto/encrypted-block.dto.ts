import { Field, ObjectType } from 'type-graphql';
import { Binary } from 'bson';

@ObjectType({ description: 'Master key encrypted for the user' })
export class EncryptedBlock {
  @Field(type => Buffer, { description: 'Salt added to encrypt the master key' })
  salt: Buffer | Binary;

  @Field(type => Buffer, { description: 'Initialization Vector', nullable: true })
  iv?: Buffer | Binary;

  @Field(type => Buffer, { description: 'Content encrypted with salt' })
  content: Buffer | Binary;

  @Field(type => Buffer, { description: 'Authentification tag' })
  authTag: Buffer | Binary;
}
