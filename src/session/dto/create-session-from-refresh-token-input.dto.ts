import { InputType, Field } from 'type-graphql';
import { IsJWT } from '../validator/is-jwt.validator';

@InputType({
  description: 'Information needed to connect to the server and retreive object from database.',
})
export class CreateSessionFromRefreshTokenInput {
  @Field({ description: 'The refresh token' })
  @IsJWT()
  token: string;
}
