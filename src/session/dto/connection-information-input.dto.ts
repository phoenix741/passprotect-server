import { InputType, Field } from 'type-graphql';

@InputType({ description: 'Information needed to connect to the server and retreive object from database.' })
export class ConnectionInformationInput {
  @Field({ description: 'Login of the user' })
  username: string;

  @Field({ description: 'Password used for connection' })
  password: string;
}
