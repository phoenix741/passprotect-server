import { Scalar } from '@nestjs/graphql';
import { CustomScalar } from '@nestjs/graphql/dist/interfaces';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', type => Date)
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date in format Timestamp';

  serialize(value: Date): number {
    return value.getTime();
  }

  parseValue(value: number): Date {
    return new Date(value);
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      const timestamp = parseInt(ast.value, 10);
      return new Date(timestamp); // ast value is always in string format
    }
    return null;
  }
}
