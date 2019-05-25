import { isString } from './lodash';

describe('lodash', () => {
  describe('isString', () => {
    it('with a string', () => {
      expect(isString('string')).toBeTruthy();
    });

    it('with an empty string', () => {
      expect(isString('')).toBeFalsy();
    });

    it('with an number', () => {
      expect(isString(13)).toBeFalsy();
    });

    it('with an bool', () => {
      expect(isString(true)).toBeFalsy();
    });
  });
});
