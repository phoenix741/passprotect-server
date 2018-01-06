// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

const { random } = require('lodash')

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

const ELEMENT_PASSWORD_2_LABEL = 'Password2'
const ELEMENT_PASSWORD_2_USERNAME = 'Username2'

const ELEMENT_CARD_LABEL = 'Element of card'
const ELEMENT_CARD_GROUP = 'Group of card'
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
      .page.LoginPage().check()
  },

  'Register a user': function (browser) {
    browser
      .page.LoginPage().register()
      .page.RegisterPage().register(username, password)
      .page.RegisterPage().submit()
      .page.ItemsPage().checkPageShown()
      .end()
  },

  'Login as the user': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .page.LoginPage().login(username, password)
      .page.LoginPage().submit()
      .page.ItemsPage().checkPageShown()
      .page.ItemsPage().closeDrawer()
  },

  'Add a text page': function (browser) {
    browser
      .page.ItemsPage().addText()

      .page.ItemPage().fillInText(ELEMENT_TEXT_LABEL, ELEMENT_TEXT_CONTENT, ELEMENT_TEXT_NOTES)
      .page.ItemPage().setGroup(ELEMENT_TEXT_GROUP)
      .page.ItemPage().submit()

      .page.ItemsPage().assertItemWithGroup(1, ELEMENT_TEXT_GROUP, ELEMENT_TEXT_LABEL, 'Général')
  },

  'Add a password page': function (browser) {
    browser
      .page.ItemsPage().addPassword()

      .page.ItemPage().fillInPassword(ELEMENT_PASSWORD_LABEL, ELEMENT_PASSWORD_USERNAME, ELEMENT_PASSWORD_PASSWORD, ELEMENT_PASSWORD_SITEURL, ELEMENT_PASSWORD_NOTES)
      .page.ItemPage().setGroup(ELEMENT_PASSWORD_GROUP)
      .page.ItemPage().submit()

      .page.ItemsPage().assertItemWithGroup(1, ELEMENT_TEXT_GROUP, ELEMENT_TEXT_LABEL, 'Général')
      .page.ItemsPage().assertItemWithGroup(4, ELEMENT_PASSWORD_GROUP, ELEMENT_PASSWORD_LABEL, 'Mot de passe')
  },

  'Add a cvv page': function (browser) {
    browser
      .page.ItemsPage().addCard()

      .page.ItemPage().fillInCard(ELEMENT_CARD_LABEL, ELEMENT_CARD_NAMEONCARD, ELEMENT_CARD_CARDNUMBER, ELEMENT_CARD_CVV, ELEMENT_CARD_EXPIRY, ELEMENT_CARD_CODE, ELEMENT_CARD_NOTE)
      .page.ItemPage().setGroup(ELEMENT_CARD_GROUP)
      .page.ItemPage().submit()

      .page.ItemsPage().assertItemWithGroup(1, ELEMENT_TEXT_GROUP, ELEMENT_TEXT_LABEL, 'Général')
      .page.ItemsPage().assertItemWithGroup(4, ELEMENT_PASSWORD_GROUP, ELEMENT_PASSWORD_LABEL, 'Mot de passe')
      .page.ItemsPage().assertItemWithGroup(7, ELEMENT_CARD_GROUP, ELEMENT_CARD_LABEL, 'Carte de paiement')

      .end()
  },

  'Test visualisation of text': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .page.LoginPage().login(username, password, true)
      .page.ItemsPage().checkPageShown()
      .page.ItemsPage().closeDrawer()

      .page.ItemsPage().selectItem(8)
      .page.ItemVisualisationPage().checkText(ELEMENT_TEXT_LABEL, ELEMENT_TEXT_CONTENT, ELEMENT_TEXT_NOTES)

      .end()
  },

  'Test visualisation of password': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .page.LoginPage().login(username, password, true)
      .page.ItemsPage().checkPageShown()
      .page.ItemsPage().closeDrawer()

      .page.ItemsPage().selectItem(5)
      .page.ItemVisualisationPage().checkPassword(ELEMENT_PASSWORD_LABEL, ELEMENT_PASSWORD_USERNAME, ELEMENT_PASSWORD_PASSWORD, ELEMENT_PASSWORD_SITEURL, ELEMENT_PASSWORD_NOTES)

      .end()
  },

  'Test visualisation of card': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .page.LoginPage().login(username, password, true)
      .page.ItemsPage().checkPageShown()
      .page.ItemsPage().closeDrawer()

      .page.ItemsPage().selectItem(2)
      .page.ItemVisualisationPage().checkCard(ELEMENT_CARD_LABEL, ELEMENT_CARD_NAMEONCARD, ELEMENT_CARD_CARDNUMBER, ELEMENT_CARD_CVV, ELEMENT_CARD_EXPIRY, ELEMENT_CARD_CODE, ELEMENT_CARD_NOTE)

      .end()
  },

  'Add a second password and make a search': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .page.LoginPage().login(username, password, true)
      .page.ItemsPage().checkPageShown()
      .page.ItemsPage().closeDrawer()

      .page.ItemsPage().addPassword()

      .page.ItemPage().fillInPassword(ELEMENT_PASSWORD_2_LABEL, ELEMENT_PASSWORD_2_USERNAME, '', '', '')
      .page.ItemPage().setGroup(ELEMENT_PASSWORD_GROUP)
      .page.ItemPage().submit()

      .page.ItemsPage().assertItemWithGroup(1, ELEMENT_CARD_GROUP, ELEMENT_CARD_LABEL, 'Carte de paiement')
      .page.ItemsPage().assertItemWithGroup(4, ELEMENT_PASSWORD_GROUP, ELEMENT_PASSWORD_LABEL, 'Mot de passe')
      .page.ItemsPage().assertItem(7, ELEMENT_PASSWORD_2_LABEL, 'Mot de passe')
      .page.ItemsPage().assertItemWithGroup(9, ELEMENT_TEXT_GROUP, ELEMENT_TEXT_LABEL, 'Général')

      .page.ItemsPage().search(ELEMENT_PASSWORD_2_LABEL)
      .pause(600)
      .page.ItemsPage().assertItemWithGroup(1, ELEMENT_PASSWORD_GROUP, ELEMENT_PASSWORD_2_LABEL, 'Mot de passe')

      .end()
  }
}
