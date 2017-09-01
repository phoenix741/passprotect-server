// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

const { random } = require('lodash')

const WAIT_TIMEOUT = 5000

const username = 'demo_' + random(1000000, 9999999)
const password = 'demodemo'

const ELEMENT_TEXT_LABEL = 'Element of text'
const ELEMENT_TEXT_GROUP = 'Group of text'
const ELEMENT_TEXT_CONTENT = 'Content of text'
const ELEMENT_TEXT_NOTES = 'Some notes'

module.exports = {
  'Starting the application, login page is shown': function (browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#app', WAIT_TIMEOUT)
      .assert.elementPresent('#login-button')
      .assert.elementPresent('#register-link')
      .assert.elementPresent('input[name="username"]')
      .assert.elementPresent('input[name="password"]')
      .assert.elementCount('input', 2)
  },

  'Register a user': function (browser) {
    browser
      .click('#register-link')
      .waitForElementVisible('input[name="passwordRepeat"]', WAIT_TIMEOUT)
      .assert.elementCount('input', 3)
      .setValue('input[name="username"]', username)
      .setValue('input[name="password"]', password)
      .setValue('input[name="passwordRepeat"]', password)
      .click('.register-button')
      .waitForElementNotPresent('.register-button', WAIT_TIMEOUT)
      .waitForElementVisible('.search-input', WAIT_TIMEOUT)
      .end()
  },

  'Login as the user': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#app', WAIT_TIMEOUT)
      .assert.elementPresent('#login-button')
      .setValue('input[name="username"]', username)
      .setValue('input[name="password"]', password)
      .click('#login-button')
      .waitForElementVisible('.search-input', WAIT_TIMEOUT)
  },

  'Add a text page': function (browser) {
    browser
      .waitForElementVisible('.search-input', WAIT_TIMEOUT)
      .assert.elementPresent('#items-add-button')
      .moveToElement('#items-add-button', 0, 0)
      .waitForElementVisible('#items-add-text-button', WAIT_TIMEOUT)
      .assert.elementPresent('#items-add-text-button')
      .assert.elementPresent('#items-add-card-button')
      .assert.elementPresent('#items-add-password-button')
      .click('#items-add-text-button')
      .waitForElementVisible('.detail-card', WAIT_TIMEOUT)

      .waitForElementVisible('#label-input', WAIT_TIMEOUT)
      .waitForElementVisible('#text-input', WAIT_TIMEOUT)

      .setValue('#label-input', ELEMENT_TEXT_LABEL)
      .setValue('#text-input', ELEMENT_TEXT_CONTENT)
      .setValue('#notes-input', ELEMENT_TEXT_NOTES)
      .click('#group-select')
      .click('.menu__content .list__tile')
      .waitForElementVisible('#group-input', WAIT_TIMEOUT)
      .setValue('#group-input', ELEMENT_TEXT_GROUP)
      .click('#detail-button')

      .waitForElementVisible('.search-input', WAIT_TIMEOUT)

      .assert.containsText('.group-title', ELEMENT_TEXT_GROUP)
      .assert.containsText('.line-title', ELEMENT_TEXT_LABEL)
      .assert.containsText('.line-type', 'Général')

      .end()
  }
}
