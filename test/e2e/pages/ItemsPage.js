'use strict'

const WAIT_TIMEOUT = 5000

module.exports = {
  elements: {
    search: '.search-input',

    addButton: '#items-add-button',
    addTextButton: '#items-add-text-button',
    addCardButton: '#items-add-card-button',
    addPasswordButton: '#items-add-password-button'
  },
  commands: [{
    checkPageShown () {
      this
        .waitForElementVisible('@search', WAIT_TIMEOUT)
      return this.api
    },

    add () {
      this
        .waitForElementVisible('@addButton', WAIT_TIMEOUT)
        .moveToElement('@addButton', 0, 0)
      return this.api
    },

    checkButton () {
      this
        .assert.elementPresent('@addTextButton')
        .assert.elementPresent('@addCardButton')
        .assert.elementPresent('@addPasswordButton')
      return this.api
    },

    addText () {
      this.add()
      this.checkButton()
      this
        .waitForElementVisible('@addTextButton', WAIT_TIMEOUT)
        .click('@addTextButton')
      return this.api
    },

    addPassword () {
      this.add()
      this.checkButton()
      this
        .waitForElementVisible('@addPasswordButton', WAIT_TIMEOUT)
        .click('@addPasswordButton')
      return this.api
    },

    addCard () {
      this.add()
      this.checkButton()
      this
        .waitForElementVisible('@addCardButton', WAIT_TIMEOUT)
        .click('@addCardButton')
      return this.api
    },

    assertItem (indice, group, title, type) {
      this
        .waitForElementVisible('@search', WAIT_TIMEOUT)

        .assert.containsText(`#items-list > li:nth-child(${indice})`, group)
        .assert.containsText(`#items-list > li:nth-child(${indice + 1}) .line-title`, title)
        .assert.containsText(`#items-list > li:nth-child(${indice + 1}) .line-type`, type)
      return this.api
    }
  }]
}
