import { ObjectIDScalar } from './object-id.scalar';
import { ObjectID } from 'bson';
import { Kind } from 'graphql';

describe('ObjectIDScalar', () => {
  let scalar: ObjectIDScalar;

  beforeEach(() => {
    scalar = new ObjectIDScalar();
  });

  describe('serialize', () => {
    it('convert to hexstring', () => {
      expect(scalar.serialize(new ObjectID('5ce5b4a58382315c12788ea1'))).toMatchSnapshot();
    });
  });

  describe('parseValue', () => {
    it('parse value', () => {
      expect(scalar.parseValue('5ce5b4a58382315c12788ea1')).toMatchSnapshot();
      expect(scalar.parseValue(new ObjectID('5ce5b4a58382315c12788ea1'))).toMatchSnapshot();
    });
  });

  describe('parseLiteral', () => {
    it('parse literal', () => {
      expect(scalar.parseLiteral({
        kind: Kind.STRING,
        value: '5ce5b4a58382315c12788ea1',
      })).toMatchSnapshot();
      expect(scalar.parseLiteral({
        kind: Kind.FLOAT,
        value: 'float',
      })).toBeNull();
    });
  });
});
