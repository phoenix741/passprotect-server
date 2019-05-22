import { DateScalar } from './date.scalar';
import { Kind } from 'graphql';

describe('DateScalar', () => {
  let scalar: DateScalar;

  beforeEach(() => {
    scalar = new DateScalar();
  });

  describe('serialize', () => {
    it('convert to timestamp', () => {
      expect(scalar.serialize(new Date(1558557861))).toMatchSnapshot();
    });
  });

  describe('parseValue', () => {
    it('parse value', () => {
      expect(scalar.parseValue(1558557861)).toMatchSnapshot();
    });
  });

  describe('parseLiteral', () => {
    it('parse literal', () => {
      expect(scalar.parseLiteral({
        kind: Kind.STRING,
        value: '1558557861',
      })).toBeNull();
      expect(scalar.parseLiteral({
        kind: Kind.INT,
        value: '1558557861',
      })).toMatchSnapshot();
    });
  });
});
