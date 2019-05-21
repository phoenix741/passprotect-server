import { InputType, Field, ID } from 'type-graphql';
import { MinLength, ValidateNested } from 'class-validator';
import { EncryptedBlockInput } from '../../shared/dto/encrypted-block-input.dto';

@InputType({ description: 'Input used to register a new user' })
export class RegistrationUserInput {
  @Field(type => ID, { description: 'Login of the user' })
  @MinLength(4)
  _id: string;

  @Field({ description: 'Password used for registration' })
  @MinLength(8)
  password: string;

  @Field(type => EncryptedBlockInput, { description: 'Encrypted master key' })
  @ValidateNested()
  encryption: EncryptedBlockInput;
}
