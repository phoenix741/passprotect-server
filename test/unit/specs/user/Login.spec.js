import { mount } from 'avoriaz'
import { expect } from 'chai'
import sinon from 'sinon'
import LoginInjector from '!!vue-loader?inject!@/components/user/Login' // eslint-disable-line

// vue-test-utils ???
describe('Login.vue', () => {
  it('should render correct contents', () => {
    const loginHandler = sinon.spy()

    const Login = LoginInjector({
      './UserService': {
        login: loginHandler
      }
    })
    console.log(Login)
    const $route = { path: 'http://www.example-path.com' }
    const LoginComponent = mount(Login, {
      globals: {
        $route
      }
    })

    const data = {
      username: 'myusername',
      password: 'mypassword'
    }

    LoginComponent.setData(data)
    console.log(LoginComponent.html())
    console.log(LoginComponent.find('#login-button')[0])
    LoginComponent.find('#login-button')[0].trigger('click')
    expect(loginHandler.called).to.equal(true)
    sinon.assert.calledWith(loginHandler, sinon.match({}), sinon.match(data))
  })
})
