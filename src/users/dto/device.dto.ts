import { ObjectType, Field } from 'type-graphql';

@ObjectType({ description: 'Information about the device' })
export class Device {
  @Field({
    description: 'ID of the device (random generated id)',
  })
  id: string;

  @Field({
    description: 'Name of the device (ex: Chrome Windows 10)',
  })
  name: string;
}
