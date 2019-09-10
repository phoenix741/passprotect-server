import { Field, ObjectType } from 'type-graphql';
import { User } from '../../users/dto/user.dto';

@ObjectType({ description: 'Result of the connection' })
export class ConnectionInformation {
  @Field({
    description: 'Token to be used in connection information',
  })
  token: string;

  @Field(type => User, { description: 'The connected user' })
  user: User;
}
