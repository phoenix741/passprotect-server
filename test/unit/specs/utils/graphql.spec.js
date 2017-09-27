import { apolloClient } from '@/utils/graphql'
import { expect } from 'chai'
import sinon from 'sinon'

describe('graphql.js', () => {
  describe('#networkInterface', () => {
    it('Test middleware of networkInterface', () => {
      const req = {
        options: {}
      }
      const next = sinon.spy()
      const middlewares = apolloClient.networkInterface._middlewares
      middlewares.forEach(m => m.applyMiddleware(req, next))
      expect(req).to.deep.equal({
        options: {
          headers: {}
        }
      })
      sinon.assert.calledWith(next)
    })
  })
})
