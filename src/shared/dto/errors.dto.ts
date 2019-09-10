import { Field, ObjectType } from 'type-graphql';
import { Error } from './error.dto';

@ObjectType({ description: 'List of errors' })
export class Errors {
  @Field(type => [Error], { description: 'List of errors' })
  errors?: Error[];
}
