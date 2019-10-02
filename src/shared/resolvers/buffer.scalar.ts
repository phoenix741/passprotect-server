import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import { Binary } from 'bson';

@Scalar('Buffer', type => Buffer)
export class BufferScalar implements CustomScalar<string, Buffer> {
  description = 'Convert Base64 to Buffer';

  serialize(value: Buffer | Binary): string {
    const buffer = value instanceof Binary ? value.buffer : Buffer.from(value);
    return buffer.toString('base64');
  }

  parseValue(value: string): Buffer {
    return Buffer.from(value, 'base64');
  }

  parseLiteral(ast: ValueNode): Buffer {
    if (ast.kind === Kind.STRING) {
      return Buffer.from(ast.value, 'base64');
    }
    return null;
  }
}
