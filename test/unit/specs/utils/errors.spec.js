import { parseErrors } from '@/utils/errors'
import { expect } from 'chai'

describe('errors.js', () => {
  describe('#parseErrors', () => {
    it('Parse error when there is not error', () => {
      expect(() => parseErrors()).to.not.throw()
      expect(() => parseErrors({})).to.not.throw()
      expect(() => parseErrors({errors: []})).to.not.throw()
    })

    it('Parse error will throw when there is one error', () => {
      expect(() => parseErrors({errors: [{fieldName: 'fieldName', message: 'message'}]})).to.throw(Error, 'message')
    })

    it('Parse error will throw when there is two error', () => {
      expect(() => parseErrors({errors: [{fieldName: 'fieldName', message: 'message2'}, {fieldName: 'fieldName', message: 'message'}]})).to.throw(Error, 'message2')
    })
  })
})
