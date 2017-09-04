'use strict'

const WAIT_TIMEOUT = 5000

module.exports = {
  elements: {
    username: 'input[name="username"]',
    password: 'input[name="password"]',
    passwordRepeat: 'input[name="passwordRepeat"]',

    registerButton: '.register-button'
  },
  commands: [{
    register (username, password) {
      this
        .assert.elementCount('input', 3)
        .waitForElementVisible('@username', WAIT_TIMEOUT)
        .setValue('@username', username)
        .waitForElementVisible('@password', WAIT_TIMEOUT)
        .setValue('@password', password)
        .waitForElementVisible('@passwordRepeat', WAIT_TIMEOUT)
        .setValue('@passwordRepeat', password)
      return this.api
    },

    submit () {
      this
        .waitForElementVisible('@registerButton', WAIT_TIMEOUT)
        .click('@registerButton')
        .waitForElementNotPresent('@registerButton', WAIT_TIMEOUT)
      return this.api
    }
  }]
}
