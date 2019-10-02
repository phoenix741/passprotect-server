import { ObjectType, Field } from 'type-graphql';

@ObjectType({ description: 'Information about the registered token' })
export class DeviceToken {
  @Field({
    description: 'Token that the device should keep to create a new session',
  })
  token: string;
}
