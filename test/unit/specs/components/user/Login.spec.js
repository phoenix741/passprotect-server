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

  it('should render correct contents', async () => {
    const data = {
      username: 'myusername',
      password: 'mypassword'
    }

    LoginComponent.setData(data)
    await LoginComponent.vm.submit()

    expect(loginHandler.called).to.equal(true)
    sinon.assert.calledWith(loginHandler, sinon.match({}), data)
  })

  it('Test validation of input (username and password required)', async () => {
    const data = {
      username: ' ',
      password: ' '
    }

    LoginComponent.setData(data)
    LoginComponent.find('input[name="username"]').trigger('blur')
    LoginComponent.find('input[name="password"]').trigger('blur')

    await Vue.nextTick()
    await LoginComponent.vm.submit()

    expect(LoginComponent.html()).to.match(/The user:login.form.username.field field is required./)
    expect(LoginComponent.html()).to.match(/The user:login.form.password.field field is required./)
    sinon.assert.notCalled(loginHandler)
  })

  it('Test validation of input (password must be at least 8 characters)', async () => {
    const data = {
      username: 'test',
      password: 'test'
    }

    LoginComponent.setData(data)
    LoginComponent.find('input[name="username"]').trigger('blur')
    LoginComponent.find('input[name="password"]').trigger('blur')

    await Vue.nextTick()
    await LoginComponent.vm.submit()

    expect(LoginComponent.html()).to.match(/The user:login.form.password.field field must be at least 8 characters./)
    sinon.assert.notCalled(loginHandler)
  })
})
