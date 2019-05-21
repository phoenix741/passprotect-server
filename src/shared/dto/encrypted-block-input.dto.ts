import { InputType, Field } from 'type-graphql';

@InputType({ description: 'Master key encrypted for the user' })
export class EncryptedBlockInput {
  @Field(type => Buffer, { description: 'Salt added to encrypt the master key' })
  salt: Buffer;

  @Field(type => Buffer, {  description: 'Initialization Vector' })
  iv: Buffer;

  @Field(type => Buffer, { description: 'Content encrypted with salt' })
  content: Buffer;

  @Field(type => Buffer, { description: 'Authentification tag' })
  authTag: Buffer;
}
