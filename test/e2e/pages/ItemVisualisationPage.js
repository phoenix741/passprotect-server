'use strict'

const WAIT_TIMEOUT = 5000

module.exports = {
  elements: {
    card: '.visualisation-card',
    label: '#label-text',
    notes: '#notes-text',

    text: '#text-text',

    username: '#username-text',
    password: '#password-text',
    siteurl: '#siteurl-text',

    nameOnCard: '#name-on-card-text',
    cardNumber: '#card-number-text',
    cvv: '#cvv-text',
    expiry: '#expiry-text',
    code: '#code-text',
    typeOfCard: '#type-of-card-text',

    editButton: '#edit-button'
  },
  commands: [{
    checkText (label, text, notes) {
      this
        .waitForElementVisible('@label', WAIT_TIMEOUT)
        .assert.containsText('@label', label)
        .waitForElementVisible('@text', WAIT_TIMEOUT)
        .assert.containsText('@text', text)
        .waitForElementVisible('@notes', WAIT_TIMEOUT)
        .assert.containsText('@notes', notes)
      return this.api
    },

    checkPassword (label, username, password, siteUrl, notes) {
      this
        .waitForElementVisible('@label', WAIT_TIMEOUT)
        .assert.containsText('@label', label)
        .waitForElementVisible('@username', WAIT_TIMEOUT)
        .assert.containsText('@username', username)
        .waitForElementVisible('@password', WAIT_TIMEOUT)
        .assert.containsText('@password', password)
        .waitForElementVisible('@siteurl', WAIT_TIMEOUT)
        .assert.containsText('@siteurl', siteUrl)
        .waitForElementVisible('@notes', WAIT_TIMEOUT)
        .assert.containsText('@notes', notes)
      return this.api
    },

    checkCard (label, nameOnCard, cardNumber, cvv, expiry, code, notes) {
      this
        .waitForElementVisible('@label', WAIT_TIMEOUT)
        .assert.containsText('@label', label)
        .waitForElementVisible('@nameOnCard', WAIT_TIMEOUT)
        .assert.containsText('@nameOnCard', nameOnCard)
        .waitForElementVisible('@cardNumber', WAIT_TIMEOUT)
        .assert.containsText('@cardNumber', cardNumber)
        .waitForElementVisible('@cvv', WAIT_TIMEOUT)
        .assert.containsText('@cvv', cvv)
        .waitForElementVisible('@expiry', WAIT_TIMEOUT)
        .assert.containsText('@expiry', expiry)
        .waitForElementVisible('@code', WAIT_TIMEOUT)
        .assert.containsText('@code', code)
        .waitForElementVisible('@notes', WAIT_TIMEOUT)
        .assert.containsText('@notes', notes)
      return this.api
    },

    goToEdition () {
      this
        .waitForElementVisible('@editButton', WAIT_TIMEOUT)
        .click('@editButton')
      return this.api
    }
  }]
}
