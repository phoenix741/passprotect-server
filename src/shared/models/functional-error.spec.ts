import { toFunctionalError, FunctionalError } from './functional-error';
import { NotImplementedException } from '@nestjs/common';

describe('FunctionalError', () => {
  describe('toFunctionalError', () => {
    it('Create the functional error, from functional error', () => {
      const error = toFunctionalError(new FunctionalError('field', 'mymessage'));
      expect(error).toMatchSnapshot('functional error');
    });

    it('Create the functional error, from http exception', () => {
      const error = toFunctionalError(new NotImplementedException('not implemented'));
      expect(error).toMatchSnapshot('http exception');
    });

    it('Create the functional error, from other exception', () => {
      const error = toFunctionalError(new Error('my error'));
      expect(error).toMatchSnapshot('other exception');
    });
  });

  describe('toGraphQL', () => {
    it('generate error for graphql', () => {
      const error = new FunctionalError('myfield', 'mymessage');
      expect(error.toGraphQL()).toMatchSnapshot('functionnal error graphql');
    });

    it('generate error for graphql 2', () => {
      const error = new FunctionalError(null, 'mymessage');
      expect(error.toGraphQL('my default field')).toMatchSnapshot('functionnal error graphql');
    });
  });
});
