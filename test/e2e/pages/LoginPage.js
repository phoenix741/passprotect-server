'use strict'

const WAIT_TIMEOUT = 5000

module.exports = {
  elements: {
    username: 'input[name="username"]',
    password: 'input[name="password"]',

    loginButton: '#login-button',
    registerLink: '#register-link'
  },
  commands: [{
    check () {
      this
        .waitForElementVisible('#app', WAIT_TIMEOUT)
        .assert.elementPresent('@loginButton')
        .assert.elementPresent('@registerLink')
        .assert.elementPresent('@username')
        .assert.elementPresent('@password')
        .assert.elementCount('input', 2)
      return this.api
    },

    register () {
      this
        .assert.elementCount('input', 2)
        .waitForElementVisible('@registerLink', WAIT_TIMEOUT)
        .click('@registerLink')
      return this.api
    },

    login (username, password, submit = false) {
      this
        .waitForElementVisible('#app', WAIT_TIMEOUT)
        .assert.elementCount('input', 2)
        .waitForElementVisible('@username', WAIT_TIMEOUT)
        .setValue('@username', username)
        .waitForElementVisible('@password', WAIT_TIMEOUT)
        .setValue('@password', password)

      if (submit) {
        this.submit()
      }

      return this.api
    },

    submit () {
      this
        .waitForElementVisible('@loginButton', WAIT_TIMEOUT)
        .click('@loginButton')
        .waitForElementNotPresent('@loginButton', WAIT_TIMEOUT)
      return this.api
    }
  }]
}
