import { middlewareLink } from '@/utils/graphql'
import sinon from 'sinon'

describe('graphql.js', () => {
  describe('#networkInterface', () => {
    it('Test middleware of networkInterface', () => {
      const req = {
        setContext: sinon.spy()
      }
      const next = sinon.spy()

      middlewareLink.request(req, next)
      sinon.assert.calledWith(req.setContext)
      sinon.assert.calledWith(next)
    })
  })
})
