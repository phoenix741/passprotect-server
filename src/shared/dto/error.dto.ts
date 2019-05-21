import { Field, ObjectType } from 'type-graphql';

@ObjectType({ description: 'Information about an error' })
export class Error {
  @Field({ description: 'Name of the field', nullable: true })
  fieldName?: string;

  @Field({ description: 'Error message', nullable: true })
  message?: string;
}
