'use strict'

const WAIT_TIMEOUT = 5000

module.exports = {
  elements: {
    card: '.detail-card',
    label: '#label-input',
    notes: '#notes-input',
    groupSelect: '#group-select',
    groupInput: '#group-input',

    text: '#text-input',

    username: '#username-input',
    password: '#password-input',
    siteurl: '#siteurl-input',

    nameOnCard: '#name-on-card-input',
    cardNumber: '#card-number-input',
    cvv: '#cvv-input',
    expiry: '#expiry-input',
    code: '#code-input',
    typeOfCard: '#type-of-card-select',

    button: '#detail-button'
  },
  commands: [{
    setGroup (group) {
      this
        .waitForElementVisible('@groupSelect', WAIT_TIMEOUT)
        .click('@groupSelect')
        .click('.menu__content .list__tile #empty-item')
        .waitForElementVisible('@groupInput', WAIT_TIMEOUT)
        .setValue('@groupInput', group)
      return this.api
    },

    fillInText (label, text, notes) {
      this
        .waitForElementVisible('@label', WAIT_TIMEOUT)
        .setValue('@label', label)
        .waitForElementVisible('@text', WAIT_TIMEOUT)
        .setValue('@text', text)
        .waitForElementVisible('@notes', WAIT_TIMEOUT)
        .setValue('@notes', notes)
      return this.api
    },

    fillInPassword (label, username, password, siteUrl, notes) {
      this
        .waitForElementVisible('@label', WAIT_TIMEOUT)
        .setValue('@label', label)
        .waitForElementVisible('@username', WAIT_TIMEOUT)
        .setValue('@username', username)
        .waitForElementVisible('@password', WAIT_TIMEOUT)
        .setValue('@password', password)
        .waitForElementVisible('@siteurl', WAIT_TIMEOUT)
        .setValue('@siteurl', siteUrl)
        .waitForElementVisible('@notes', WAIT_TIMEOUT)
        .setValue('@notes', notes)
      return this.api
    },

    fillInCard (label, nameOnCard, cardNumber, cvv, expiry, code, notes) {
      this
        .waitForElementVisible('@label', WAIT_TIMEOUT)
        .setValue('@label', label)
        .waitForElementVisible('@nameOnCard', WAIT_TIMEOUT)
        .setValue('@nameOnCard', nameOnCard)
        .waitForElementVisible('@cardNumber', WAIT_TIMEOUT)
        .setValue('@cardNumber', cardNumber)
        .waitForElementVisible('@cvv', WAIT_TIMEOUT)
        .setValue('@cvv', cvv)
        .waitForElementVisible('@expiry', WAIT_TIMEOUT)
        .setValue('@expiry', expiry)
        .waitForElementVisible('@code', WAIT_TIMEOUT)
        .setValue('@code', code)
        .waitForElementVisible('@notes', WAIT_TIMEOUT)
        .setValue('@notes', notes)
        .waitForElementVisible('@typeOfCard', WAIT_TIMEOUT)
        .click('@typeOfCard')
        .click('.menu__content .list__tile')
      return this.api
    },

    submit () {
      this
        .waitForElementVisible('@button', WAIT_TIMEOUT)
        .click('@button')
      return this.api
    }
  }]
}
