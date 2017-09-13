import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Vue from 'vue'
import Router from 'vue-router'
import LoginInjector from '!!vue-loader?inject!@/components/user/Login.vue' // eslint-disable-line

describe('Login.vue', () => {
  let LoginComponent, loginHandler
  beforeEach(() => {
    loginHandler = sinon.spy()
    const LoginWithMocks = LoginInjector({
      './UserService': {
        login: loginHandler
      }
    })

    const mockRouter = new Router({ routes: [ { path: '/register', name: 'register' } ] })

    LoginComponent = shallow(LoginWithMocks, {
      router: mockRouter
    })
  })

  it('should render correct contents', () => {
    const data = {
      username: 'myusername',
      password: 'mypassword'
    }

    LoginComponent.setData(data)
    LoginComponent.find('#login-button').trigger('click')

    expect(loginHandler.called).to.equal(true)
    sinon.assert.calledWith(loginHandler, sinon.match({}), data)
  })

  it('Test validation of input (username and password required)', done => {
    const data = {
      username: ' ',
      password: ' '
    }

    LoginComponent.setData(data)
    LoginComponent.find('input[name="username"]').trigger('blur')
    LoginComponent.find('input[name="password"]').trigger('blur')

    Vue.nextTick(() => {
      LoginComponent.find('#login-button').trigger('click')
      expect(LoginComponent.html()).to.match(/The user:login.form.username.field field is required./)
      expect(LoginComponent.html()).to.match(/The user:login.form.password.field field is required./)
      sinon.assert.notCalled(loginHandler)
      done()
    })
  })

  it('Test validation of input (password must be at least 8 characters)', done => {
    const data = {
      username: 'test',
      password: 'test'
    }

    LoginComponent.setData(data)
    LoginComponent.find('input[name="username"]').trigger('blur')
    LoginComponent.find('input[name="password"]').trigger('blur')

    Vue.nextTick(() => {
      LoginComponent.find('#login-button').trigger('click')
      expect(LoginComponent.html()).to.match(/The user:login.form.password.field field must be at least 8 characters./)
      sinon.assert.notCalled(loginHandler)
      done()
    })
  })

  it('Show error when username is wrong server side', done => {
    const data = {
      username: 'test',
      password: 'testtest',
      error: {fieldName: 'username', message: 'Server side server'}
    }

    LoginComponent.setData(data)

    Vue.nextTick(() => {
      expect(LoginComponent.html()).to.match(/Server side server/)
      done()
    })
  })

  it('Show error when password is wrong server side', done => {
    const data = {
      username: 'test',
      password: 'testtest',
      error: {fieldName: 'password', message: 'Server side server'}
    }

    LoginComponent.setData(data)

    Vue.nextTick(() => {
      expect(LoginComponent.html()).to.match(/Server side server/)
      done()
    })
  })

  it('Show error when password is wrong server side', done => {
    const data = {
      username: 'test',
      password: 'testtest',
      error: {fieldName: 'global', message: 'Server side server'}
    }

    LoginComponent.setData(data)

    Vue.nextTick(() => {
      expect(LoginComponent.html()).to.match(/Server side server/)
      done()
    })
  })
})
