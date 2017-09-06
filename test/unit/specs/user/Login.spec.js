import Vue from 'vue'
import Login from '@/components/user/Login'

// vue-test-utils ???
describe('Login.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Login)
    const vm = new Constructor().$mount()

    const usernameInput = vm.$el.querySelector('input[name="username"]')
    const passwordInput = vm.$el.querySelector('input[name="password"]')

    expect(usernameInput.value).to.equal('')
    expect(passwordInput.value).to.equal('')
  })
})
