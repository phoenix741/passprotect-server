import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import LoginInjector from '!!vue-loader?inject!@/components/user/Login' // eslint-disable-line

describe('Login.vue', () => {
  it('should render correct contents', () => {
    const loginHandler = sinon.spy()

    const LoginWithMocks = LoginInjector({
      './UserService': {
        login: loginHandler
      }
    })

    console.log(LoginWithMocks)
    const $route = { path: 'http://www.example-path.com' }

    const LoginComponent = shallow(LoginWithMocks, { intercept: { $route } })

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
