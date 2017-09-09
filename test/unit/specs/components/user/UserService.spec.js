import sinon from 'sinon'
import { expect } from 'chai'
import Promise from 'bluebird'
import { login, logout, SESSION } from '@/components/user/UserService'

describe('UserService.js', () => {
  describe('#login', () => {
    let context, creds
    beforeEach(() => {
      creds = {
        username: 'CREDENTIALS',
        password: 'password1'
      }
      const response = {
        data: {
          createSession: {
            token: 'jwtToken',
            user: {
              encryption: {
                salt: 'salt1',
                encryptedKey: {content: '65d73be2490996f24b7f54e0ac48f6', authTag: 'ada3386bd63223e7ea6923767c00128a'}
              }
            }
          }
        }
      }
      context = {
        $apollo: {
          mutate: sinon.stub().returns(Promise.resolve(response))
        },
        $router: {
          go: function () {},
          push: function () {}
        }
      }
      sinon.spy(context.$router, 'push')
      sinon.spy(context.$router, 'go')
    })

    it('Try to login to server with success without redirect', () => {
      return login(context, creds)
        .then(response => {
          sinon.assert.calledWith(context.$router.push, '/items')
          expect(SESSION.authenticated).to.equal(true)
          expect(SESSION.jwtToken).to.equal('jwtToken')
          expect(SESSION.username).to.equal('CREDENTIALS')
          expect(SESSION.clearKey).to.equal('text to encrypt')
        })
    })

    it('Try to login to server with success with redirect', () => {
      return login(context, creds, 'mytest')
        .then(response => {
          sinon.assert.calledWith(context.$router.go, 'mytest')
          expect(SESSION.authenticated).to.equal(true)
          expect(SESSION.jwtToken).to.equal('jwtToken')
          expect(SESSION.username).to.equal('CREDENTIALS')
          expect(SESSION.clearKey).to.equal('text to encrypt')
        })
    })
  })

  describe('#logout', () => {
    it('Test logout', () => {
      const context = {
        $apollo: {
          provider: {
            defaultClient: {
              resetStore: function () {}
            }
          }
        },
        $router: {
          push: function () {}
        }
      }
      sinon.spy(context.$router, 'push')
      sinon.spy(context.$apollo.provider.defaultClient, 'resetStore')

      logout(context)

      sinon.assert.calledWith(context.$router.push, '/items')
      sinon.assert.calledOnce(context.$apollo.provider.defaultClient.resetStore)
      expect(SESSION.authenticated).to.equal(false)
      expect(SESSION.jwtToken).to.be.an('undefined')
      expect(SESSION.username).to.be.an('undefined')
      expect(SESSION.clearKey).to.be.an('undefined')
    })
  })
})
