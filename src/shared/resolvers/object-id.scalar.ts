import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import { ObjectID } from 'bson';

@Scalar('ObjectID', type => ObjectID)
export class ObjectIDScalar implements CustomScalar<string, ObjectID> {
  description = 'Convert String to ObjectID';

  serialize(value: ObjectID): string {
    return value.toHexString();
  }

  parseValue(value: string | ObjectID): ObjectID {
    return new ObjectID(value);
  }

  parseLiteral(ast: ValueNode): ObjectID {
    if (ast.kind === Kind.STRING) {
      return new ObjectID(ast.value);
    }
    return null;
  }
}
