import { InputType, Field } from 'type-graphql';
import { MinLength, IsString } from 'class-validator';

@InputType({
  description: 'Information needed to connect to the server and retreive object from database.',
})
export class ConnectionInformationInput {
  @Field({ description: 'Login of the user' })
  @IsString()
  username: string;

  @Field({ description: 'Password used for connection' })
  @IsString()
  @MinLength(8)
  password: string;
}
