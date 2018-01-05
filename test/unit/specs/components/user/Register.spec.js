import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Vue from 'vue'
import Router from 'vue-router'
import RegisterInjector from '!!vue-loader?inject!@/components/user/Register.vue' // eslint-disable-line

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

  it('should render correct contents', async () => {
    const data = {
      username: 'myusername',
      password: 'mypassword',
      passwordRepeat: 'mypassword'
    }

    RegisterComponent.setData(data)
    await RegisterComponent.vm.submit()

    expect(signupHandler.called).to.equal(true)
    sinon.assert.calledWith(signupHandler, sinon.match({}), {
      username: 'myusername',
      password: 'mypassword'
    })
  })

  it('Test validation of input (username and password required)', async () => {
    const data = {
      username: ' ',
      password: ' ',
      passwordRepeat: ' '
    }

    RegisterComponent.setData(data)
    RegisterComponent.find('input[name="username"]').trigger('blur')
    RegisterComponent.find('input[name="password"]').trigger('blur')
    RegisterComponent.find('input[name="passwordRepeat"]').trigger('blur')

    await Vue.nextTick()
    await RegisterComponent.vm.submit()

    expect(RegisterComponent.html()).to.match(/The user:register.form.identity_username.field field is required./)
    expect(RegisterComponent.html()).to.match(/The user:register.form.identity_password1.field field is required./)
    expect(RegisterComponent.html()).to.match(/The user:register.form.identity_password2.field field is required./)
    sinon.assert.notCalled(signupHandler)
  })

  it('Test validation of input (password must be at least 8 characters)', async () => {
    const data = {
      username: 'test',
      password: 'test',
      passwordRepeat: 'test'
    }

    RegisterComponent.setData(data)
    RegisterComponent.find('input[name="username"]').trigger('blur')
    RegisterComponent.find('input[name="password"]').trigger('blur')
    RegisterComponent.find('input[name="passwordRepeat"]').trigger('blur')

    await Vue.nextTick()
    await RegisterComponent.vm.submit()

    expect(RegisterComponent.html()).to.match(/The user:register.form.identity_password1.field field must be at least 8 characters./)
    sinon.assert.notCalled(signupHandler)
  })

  it('Test validation of input (password different)', async () => {
    const data = {
      username: 'test',
      password: 'testtest',
      passwordRepeat: 'xxxxxxxx'
    }

    RegisterComponent.setData(data)
    RegisterComponent.find('input[name="username"]').trigger('blur')
    RegisterComponent.find('input[name="password"]').trigger('blur')
    RegisterComponent.find('input[name="passwordRepeat"]').trigger('blur')

    await Vue.nextTick()
    await RegisterComponent.vm.submit()

    expect(RegisterComponent.html()).to.match(/The user:register.form.identity_password2.field confirmation does not match./)
    sinon.assert.notCalled(signupHandler)
  })
})
