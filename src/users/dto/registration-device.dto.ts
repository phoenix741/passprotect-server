import { InputType, Field } from 'type-graphql';
import { Length } from 'class-validator';

@InputType({ description: 'Input used to register a new device for a user' })
export class RegistrationDeviceInput {
  @Field({ description: 'Uniq id of the device' })
  @Length(32)
  id: string;

  @Field({ description: 'User name of the device' })
  name: string;
}
