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

const ELEMENT_PASSWORD_LABEL = 'Element of password'
const ELEMENT_PASSWORD_GROUP = 'Group of password'
const ELEMENT_PASSWORD_USERNAME = 'MyUsername'
const ELEMENT_PASSWORD_PASSWORD = 'MyPassword'
const ELEMENT_PASSWORD_SITEURL = 'http://siteUrl.fr'
const ELEMENT_PASSWORD_NOTES = 'Some notes for password'

const ELEMENT_CARD_LABEL = 'Element of card'
const ELEMENT_CARD_GROUP = 'Group of card'
const ELEMENT_CARD_TYPEOFCARD = 'VISA'
const ELEMENT_CARD_NAMEONCARD = 'My name is J'
const ELEMENT_CARD_CARDNUMBER = '1234 5678 9874 5463 1254'
const ELEMENT_CARD_CVV = '123'
const ELEMENT_CARD_EXPIRY = '12/02'
const ELEMENT_CARD_CODE = '1234'
const ELEMENT_CARD_NOTE = 'Some notes for card'

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
      .click('.menu__content .list__tile #empty-item')
      .waitForElementVisible('#group-input', WAIT_TIMEOUT)
      .setValue('#group-input', ELEMENT_TEXT_GROUP)
      .click('#detail-button')

      .waitForElementVisible('.search-input', WAIT_TIMEOUT)

      .assert.containsText('.group-title', ELEMENT_TEXT_GROUP)
      .assert.containsText('.line-title', ELEMENT_TEXT_LABEL)
      .assert.containsText('.line-type', 'Général')
  },

  'Add a password page': function (browser) {
    browser
      .waitForElementVisible('.search-input', WAIT_TIMEOUT)
      .assert.elementPresent('#items-add-button')
      .moveToElement('#items-add-button', 0, 0)
      .waitForElementVisible('#items-add-password-button', WAIT_TIMEOUT)
      .assert.elementPresent('#items-add-text-button')
      .assert.elementPresent('#items-add-card-button')
      .assert.elementPresent('#items-add-password-button')
      .click('#items-add-password-button')
      .waitForElementVisible('.detail-card', WAIT_TIMEOUT)

      .waitForElementVisible('#label-input', WAIT_TIMEOUT)
      .waitForElementVisible('#username-input', WAIT_TIMEOUT)

      .setValue('#label-input', ELEMENT_PASSWORD_LABEL)
      .setValue('#username-input', ELEMENT_PASSWORD_USERNAME)
      .setValue('#password-input', ELEMENT_PASSWORD_PASSWORD)
      .setValue('#siteurl-input', ELEMENT_PASSWORD_SITEURL)
      .setValue('#notes-input', ELEMENT_PASSWORD_NOTES)
      .click('#group-select')
      .click('.menu__content .list__tile #empty-item')
      .waitForElementVisible('#group-input', WAIT_TIMEOUT)
      .setValue('#group-input', ELEMENT_PASSWORD_GROUP)
      .click('#detail-button')

      .waitForElementVisible('.search-input', WAIT_TIMEOUT)

      .assert.containsText('#items-list > li:nth-child(1)', ELEMENT_TEXT_GROUP)
      .assert.containsText('#items-list > li:nth-child(2) .line-title', ELEMENT_TEXT_LABEL)
      .assert.containsText('#items-list > li:nth-child(2) .line-type', 'Général')

      .assert.containsText('#items-list > li:nth-child(4)', ELEMENT_PASSWORD_GROUP)
      .assert.containsText('#items-list > li:nth-child(5) .line-title', ELEMENT_PASSWORD_LABEL)
      .assert.containsText('#items-list > li:nth-child(5) .line-type', 'Mot de passe')
  },

  'Add a cvv page': function (browser) {
    browser
      .waitForElementVisible('.search-input', WAIT_TIMEOUT)
      .assert.elementPresent('#items-add-button')
      .moveToElement('#items-add-button', 0, 0)
      .waitForElementVisible('#items-add-card-button', WAIT_TIMEOUT)
      .assert.elementPresent('#items-add-text-button')
      .assert.elementPresent('#items-add-card-button')
      .assert.elementPresent('#items-add-password-button')
      .click('#items-add-card-button')
      .waitForElementVisible('.detail-card', WAIT_TIMEOUT)

      .waitForElementVisible('#label-input', WAIT_TIMEOUT)
      .waitForElementVisible('#name-on-card-input', WAIT_TIMEOUT)

      .setValue('#label-input', ELEMENT_CARD_LABEL)
      .setValue('#name-on-card-input', ELEMENT_CARD_NAMEONCARD)
      .setValue('#card-number-input', ELEMENT_CARD_CARDNUMBER)
      .setValue('#cvv-input', ELEMENT_CARD_CVV)
      .setValue('#expiry-input', ELEMENT_CARD_EXPIRY)
      .setValue('#code-input', ELEMENT_CARD_CODE)
      .setValue('#notes-input', ELEMENT_CARD_NOTE)

      .click('#group-select')
      .click('.menu__content .list__tile #empty-item')
      .waitForElementVisible('#group-input', WAIT_TIMEOUT)
      .setValue('#group-input', ELEMENT_CARD_GROUP)

      .click('#type-of-card-select')
      .click('.menu__content .list__tile')

      .click('#detail-button')

      .waitForElementVisible('.search-input', WAIT_TIMEOUT)

      .assert.containsText('#items-list > li:nth-child(1)', ELEMENT_TEXT_GROUP)
      .assert.containsText('#items-list > li:nth-child(2) .line-title', ELEMENT_TEXT_LABEL)
      .assert.containsText('#items-list > li:nth-child(2) .line-type', 'Général')

      .assert.containsText('#items-list > li:nth-child(4)', ELEMENT_PASSWORD_GROUP)
      .assert.containsText('#items-list > li:nth-child(5) .line-title', ELEMENT_PASSWORD_LABEL)
      .assert.containsText('#items-list > li:nth-child(5) .line-type', 'Mot de passe')

      .assert.containsText('#items-list > li:nth-child(7)', ELEMENT_CARD_GROUP)
      .assert.containsText('#items-list > li:nth-child(8) .line-title', ELEMENT_CARD_LABEL)
      .assert.containsText('#items-list > li:nth-child(8) .line-type', 'Carte de paiement')

      .end()
  }
}
