'use strict'

const WAIT_TIMEOUT = 5000

module.exports = {
  elements: {
    overlay: '.overlay.overlay--active',
    search: '.search-input input',

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

    closeDrawer () {
      this
        .moveToElement('@overlay', 10, 10)
        .click('@overlay')
      return this.api
    },

    add () {
      this
        .waitForElementVisible('@addButton', WAIT_TIMEOUT)
        .moveToElement('@addButton', 0, 0)
      return this.api
    },

    checkButton () {
      this.api.pause(300)
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
        .moveToElement('body', 0, 0)
      return this.api
    },

    addPassword () {
      this.add()
      this.checkButton()
      this
        .waitForElementVisible('@addPasswordButton', WAIT_TIMEOUT)
        .click('@addPasswordButton')
        .moveToElement('body', 0, 0)
      return this.api
    },

    addCard () {
      this.add()
      this.checkButton()
      this
        .waitForElementVisible('@addCardButton', WAIT_TIMEOUT)
        .click('@addCardButton')
        .moveToElement('body', 0, 0)
      return this.api
    },

    search (search) {
      this
        .waitForElementVisible('@search', WAIT_TIMEOUT)
        .setValue('@search', search)
      return this.api
    },

    assertItem (indice, title, type) {
      this
        .assert.containsText(`#items-list > li:nth-child(${indice}) .line-title`, title)
        .assert.containsText(`#items-list > li:nth-child(${indice}) .line-type`, type)
      return this.api
    },

    assertItemWithGroup (indice, group, title, type) {
      this
        .waitForElementVisible('@search', WAIT_TIMEOUT)

        .assert.containsText(`#items-list > li:nth-child(${indice})`, group)
        .assertItem(indice + 1, title, type)
      return this.api
    },

    selectItem (indice) {
      this
        .waitForElementVisible('@search', WAIT_TIMEOUT)

        .click(`#items-list > li:nth-child(${indice}) .line-title`)
      return this.api
    }
  }]
}
