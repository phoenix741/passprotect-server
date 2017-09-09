/* global localStorage */

import sinon from 'sinon'
import { expect } from 'chai'
import Promise from 'bluebird'
import { login, logout, signup, checkAuth, getAuthHeader, SESSION } from '@/components/user/UserService'

describe('UserService.js', () => {
  const responseRegister = {
    data: {
      registerUser: {}
    }
  }
  const responseSignin = {
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

  describe('#login', () => {
    let context, creds
    beforeEach(() => {
      creds = {
        username: 'CREDENTIALS',
        password: 'password1'
      }
      context = {
        $apollo: {
          mutate: sinon.stub().returns(Promise.resolve(responseSignin))
        },
        $router: {
          go: function () {},
          push: function () {}
        }
      }
      sinon.spy(context.$router, 'push')
      sinon.spy(context.$router, 'go')
    })

    afterEach(() => {
      SESSION.authenticated = false
    })

    it('Try to login to server with success without redirect', () => {
      return login(context, creds)
        .then(response => {
          sinon.assert.calledWith(context.$router.push, '/items')
          expect(SESSION.authenticated).to.equal(true)
          expect(SESSION.jwtToken).to.equal('jwtToken')
          expect(SESSION.username).to.equal('CREDENTIALS')
          expect(SESSION.clearKey).to.equal('text to encrypt')

          expect(localStorage.getItem('jwtToken')).to.equal('jwtToken')
          expect(localStorage.getItem('username')).to.equal('CREDENTIALS')
          expect(localStorage.getItem('clearKey')).to.equal('text to encrypt')

          expect(context.error).to.be.an('undefined')
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

          expect(localStorage.getItem('jwtToken')).to.equal('jwtToken')
          expect(localStorage.getItem('username')).to.equal('CREDENTIALS')
          expect(localStorage.getItem('clearKey')).to.equal('text to encrypt')

          expect(context.error).to.be.an('undefined')
        })
    })

    it('Try to login to server with failure', () => {
      context.$apollo.mutate = sinon.stub().returns(Promise.reject(new Error('loginerror')))

      return login(context, creds)
        .then(response => {
          expect(context.error).to.be.an('Error')
          expect(SESSION.authenticated).to.equal(false)
        })
    })
  })

  describe('#signup', () => {
    let context, creds
    beforeEach(() => {
      creds = {
        username: 'CREDENTIALS',
        password: 'password1'
      }
      context = {
        $apollo: {
          mutate: sinon.stub()
            .onFirstCall().returns(Promise.resolve(responseRegister))
            .onSecondCall().returns(Promise.resolve(responseSignin))
        },
        $router: {
          go: function () {},
          push: function () {}
        }
      }
      sinon.spy(context.$router, 'push')
      sinon.spy(context.$router, 'go')
    })

    afterEach(() => {
      SESSION.authenticated = false
    })

    it('Sign with no error', () => {
      return signup(context, creds)
        .then(response => {
          sinon.assert.calledWith(context.$router.push, '/items')
          expect(SESSION.authenticated).to.equal(true)
          expect(SESSION.jwtToken).to.equal('jwtToken')
          expect(SESSION.username).to.equal('CREDENTIALS')
          expect(SESSION.clearKey).to.equal('text to encrypt')
          expect(context.error).to.be.an('undefined')
        })
    })

    it('Sign with error', () => {
      context.$apollo.mutate = sinon.stub().returns(Promise.reject(new Error('signinerror')))

      return signup(context, creds)
        .then(response => {
          expect(context.error).to.be.an('Error')
          expect(SESSION.authenticated).to.equal(false)
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

  describe('#checkAuth', () => {
    it('Check auth with a valid user', () => {
      localStorage.setItem('jwtToken', 'jwt')
      localStorage.setItem('username', 'username')
      localStorage.setItem('clearKey', 'key')

      checkAuth()

      expect(SESSION.authenticated).to.equal(true)
      expect(SESSION.jwtToken).to.equal('jwt')
      expect(SESSION.username).to.equal('username')
      expect(SESSION.clearKey).to.equal('key')

      expect(getAuthHeader()).to.deep.equal({
        Authorization: 'jwt'
      })
    })

    it('Check auth with a invalid user', () => {
      localStorage.setItem('jwtToken', '')
      localStorage.setItem('username', 'xxx')
      localStorage.setItem('clearKey', 'yyy')

      checkAuth()

      expect(SESSION.authenticated).to.equal(false)
      expect(SESSION.jwtToken).to.equal('')
      expect(SESSION.username).to.equal('xxx')
      expect(SESSION.clearKey).to.equal('yyy')

      expect(getAuthHeader()).to.deep.equal({
        Authorization: ''
      })
    })
  })
})
