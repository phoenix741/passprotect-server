import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Vue from 'vue'
import Router from 'vue-router'
import RegisterInjector from '!!vue-loader?inject&transformToRequire=true!@/components/user/Register.vue' // eslint-disable-line

describe('Register.vue', () => {
  let RegisterComponent, signupHandler
  beforeEach(() => {
    signupHandler = sinon.spy()
    const RegisterWithMocks = RegisterInjector({
      './UserService': {
        signup: signupHandler
      }
    })

    const mockRouter = new Router({ routes: [] })

    RegisterComponent = shallow(RegisterWithMocks, {
      router: mockRouter
    })
  })

  it('should render correct contents', () => {
    const data = {
      username: 'myusername',
      password: 'mypassword',
      passwordRepeat: 'mypassword'
    }

    RegisterComponent.setData(data)
    RegisterComponent.find('.register-button').trigger('click')

    expect(signupHandler.called).to.equal(true)
    sinon.assert.calledWith(signupHandler, sinon.match({}), {
      username: 'myusername',
      password: 'mypassword'
    })
  })

  it('Test validation of input (username and password required)', done => {
    const data = {
      username: ' ',
      password: ' ',
      passwordRepeat: ' '
    }

    RegisterComponent.setData(data)
    RegisterComponent.find('input[name="username"]').trigger('blur')
    RegisterComponent.find('input[name="password"]').trigger('blur')
    RegisterComponent.find('input[name="passwordRepeat"]').trigger('blur')

    Vue.nextTick(() => {
      RegisterComponent.find('.register-button').trigger('click')
      expect(RegisterComponent.html()).to.match(/The user:register.form.identity_username.field field is required./)
      expect(RegisterComponent.html()).to.match(/The user:register.form.identity_password1.field field is required./)
      expect(RegisterComponent.html()).to.match(/The user:register.form.identity_password2.field field is required./)
      sinon.assert.notCalled(signupHandler)
      done()
    })
  })

  it('Test validation of input (password must be at least 8 characters)', done => {
    const data = {
      username: 'test',
      password: 'test',
      passwordRepeat: 'test'
    }

    RegisterComponent.setData(data)
    RegisterComponent.find('input[name="username"]').trigger('blur')
    RegisterComponent.find('input[name="password"]').trigger('blur')
    RegisterComponent.find('input[name="passwordRepeat"]').trigger('blur')

    Vue.nextTick(() => {
      RegisterComponent.find('.register-button').trigger('click')
      expect(RegisterComponent.html()).to.match(/The user:register.form.identity_password1.field field must be at least 8 characters./)
      sinon.assert.notCalled(signupHandler)
      done()
    })
  })

  it('Test validation of input (password different)', done => {
    const data = {
      username: 'test',
      password: 'testtest',
      passwordRepeat: 'xxxxxxxx'
    }

    RegisterComponent.setData(data)
    RegisterComponent.find('input[name="username"]').trigger('blur')
    RegisterComponent.find('input[name="password"]').trigger('blur')
    RegisterComponent.find('input[name="passwordRepeat"]').trigger('blur')

    Vue.nextTick(() => {
      RegisterComponent.find('.register-button').trigger('click')
      expect(RegisterComponent.html()).to.match(/The user:register.form.identity_password2.field confirmation does not match./)
      sinon.assert.notCalled(signupHandler)
      done()
    })
  })

  it('Show error when username is wrong server side', done => {
    const data = {
      username: 'test',
      password: 'testtest',
      passwordRepeat: 'testtest',
      error: {fieldName: '_id', message: 'Server side server'}
    }

    RegisterComponent.setData(data)

    Vue.nextTick(() => {
      expect(RegisterComponent.html()).to.match(/Server side server/)
      done()
    })
  })

  it('Show error when password is wrong server side', done => {
    const data = {
      username: 'test',
      password: 'testtest',
      passwordRepeat: 'testtest',
      error: {fieldName: 'password', message: 'Server side server'}
    }

    RegisterComponent.setData(data)

    Vue.nextTick(() => {
      expect(RegisterComponent.html()).to.match(/Server side server/)
      done()
    })
  })

  it('Show error when password is wrong server side', done => {
    const data = {
      username: 'test',
      password: 'testtest',
      passwordRepeat: 'testtest',
      error: {fieldName: 'global', message: 'Server side server'}
    }

    RegisterComponent.setData(data)

    Vue.nextTick(() => {
      expect(RegisterComponent.html()).to.match(/Server side server/)
      done()
    })
  })
})
