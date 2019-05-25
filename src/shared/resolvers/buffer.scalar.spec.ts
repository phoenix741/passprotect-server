import { BufferScalar } from './buffer.scalar';
import { Binary } from 'bson';
import { Kind } from 'graphql';

describe('BufferScalar', () => {
  let scalar: BufferScalar;

  beforeEach(() => {
    scalar = new BufferScalar();
  });

  describe('serialize', () => {
    it('convert to base64', () => {
      expect(
        scalar.serialize(Buffer.from('ceci est un test')),
      ).toMatchSnapshot();
      expect(
        scalar.serialize(new Binary(Buffer.from('ceci est un test'))),
      ).toMatchSnapshot();
    });
  });

  describe('parseValue', () => {
    it('parse value', () => {
      expect(scalar.parseValue('Y2VjaSBlc3QgdW4gdGVzdA==')).toMatchSnapshot();
    });
  });

  describe('parseLiteral', () => {
    it('parse literal', () => {
      expect(
        scalar.parseLiteral({
          kind: Kind.STRING,
          value: 'Y2VjaSBlc3QgdW4gdGVzdA==',
        }),
      ).toMatchSnapshot();
      expect(
        scalar.parseLiteral({
          kind: Kind.INT,
          value: 'Y2VjaSBlc3QgdW4gdGVzdA==',
        }),
      ).toBeNull();
    });
  });
});
