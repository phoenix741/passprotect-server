import { InputType, Field } from 'type-graphql';
import { Length } from 'class-validator';

@InputType({ description: 'Input used to revoke a device' })
export class RevokeDeviceInput {
  @Field({ description: 'Uniq id of the device' })
  @Length(32)
  id: string;
}
