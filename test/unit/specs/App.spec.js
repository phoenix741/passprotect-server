import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Router from 'vue-router'
import AppInjector from '!!vue-loader?inject&transformToRequire=true!@/App.vue' // eslint-disable-line

describe('App.vue', () => {
  let AppComponent, logoutHandler, SESSION, exportLinesAsCsvHandler

  const mockRouter = new Router({ routes: [
    { path: '/login', name: 'login' },
    { path: '/items', name: 'items' },
    { path: '/about', name: 'about' }
  ]})

  beforeEach(() => {
    SESSION = {
      authenticated: false,
      username: null
    }

    logoutHandler = sinon.spy()
    exportLinesAsCsvHandler = sinon.spy()
  })

  it('should render without authentification', () => {
    const AppWithMocks = AppInjector({
      './components/user/UserService': {SESSION, logout: logoutHandler},
      './components/items/ItemService': {exportLinesAsCsv: exportLinesAsCsvHandler}
    })

    AppComponent = shallow(AppWithMocks, {
      router: mockRouter
    })

    expect(AppComponent.find('.title-content').html()).to.match(/user:toolbar.notlogged/)
    expect(AppComponent.find('.connect-link').html()).to.match(/app.menu.connect/)
    expect(AppComponent.find('.items-link').exists()).to.be.false // eslint-disable-line no-unused-expressions
    expect(AppComponent.find('.export-link').exists()).to.be.false // eslint-disable-line no-unused-expressions
    expect(AppComponent.find('.logout-link').exists()).to.be.false // eslint-disable-line no-unused-expressions
    expect(AppComponent.find('.about-link').html()).to.match(/app.menu.about/)
  })

  it('should render with authentification', () => {
    SESSION.authenticated = true
    SESSION.username = 'myusername'

    const AppWithMocks = AppInjector({
      './components/user/UserService': {SESSION, logout: logoutHandler},
      './components/items/ItemService': {exportLinesAsCsv: exportLinesAsCsvHandler}
    })

    AppComponent = shallow(AppWithMocks, {
      router: mockRouter
    })

    expect(AppComponent.find('.title-content').html()).to.match(/myusername/)
    expect(AppComponent.find('.connect-link').exists()).to.be.false // eslint-disable-line no-unused-expressions
    expect(AppComponent.find('.items-link').html()).to.match(/app.menu.items/)
    expect(AppComponent.find('.export-link').html()).to.match(/app.menu.export/)
    expect(AppComponent.find('.logout-link').html()).to.match(/app.menu.logout/)
    expect(AppComponent.find('.about-link').html()).to.match(/app.menu.about/)
  })

  it('log out call logout ', () => {
    SESSION.authenticated = true
    SESSION.username = 'myusername'

    const AppWithMocks = AppInjector({
      './components/user/UserService': {SESSION, logout: logoutHandler},
      './components/items/ItemService': {exportLinesAsCsv: exportLinesAsCsvHandler}
    })

    AppComponent = shallow(AppWithMocks, {
      router: mockRouter
    })

    AppComponent.find('.logout-link').trigger('click')
    sinon.assert.calledWith(logoutHandler, sinon.match({}))
  })

  it('export call export ', () => {
    SESSION.authenticated = true
    SESSION.username = 'myusername'

    const AppWithMocks = AppInjector({
      './components/user/UserService': {SESSION, logout: logoutHandler},
      './components/items/ItemService': {exportLinesAsCsv: exportLinesAsCsvHandler}
    })

    AppComponent = shallow(AppWithMocks, {
      router: mockRouter
    })

    AppComponent.find('.export-link').trigger('click')
    sinon.assert.calledWith(exportLinesAsCsvHandler, sinon.match({}))
  })
})
