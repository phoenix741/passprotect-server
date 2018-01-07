import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Router from 'vue-router'
import Vue from 'vue'
import ItemsInjector from '!!vue-loader?inject!@/components/items/Items.vue' // eslint-disable-line
import {cardTypeMapping} from '@/components/items/ItemService'

describe('Items.vue', () => {
  let ItemsComponent, ItemsWithMocks, mockRouter, removeLineHandler, logoutHandler, exportLinesAsCsvHandler
  const SESSION = {
    authenticated: true,
    username: 'myusername'
  }
  const ITEMS_LIST = {
    data: {
      lines: [
        {
          _id: '57fa53b5d3cd8c0013ac93ff',
          type: 'text',
          label: 'Mon Texte',
          group: 'titi',
          __typename: 'WalletLine'
        },
        {
          _id: '57fa539bd3cd8c0013ac93fe',
          type: 'password',
          label: 'Mon mot de passe',
          group: 'titi',
          __typename: 'WalletLine'
        },
        {
          _id: '57fa9c04b2bc100011505a4b',
          type: 'text',
          label: 'Text',
          group: 'titi',
          __typename: 'WalletLine'
        },
        {
          _id: '57fa5386d3cd8c0013ac93fd',
          type: 'card',
          label: 'Carte bancaire',
          group: 'toto',
          __typename: 'WalletLine'
        }
      ]
    }
  }

  beforeEach(() => {
    logoutHandler = sinon.spy()
    exportLinesAsCsvHandler = sinon.spy()
    removeLineHandler = sinon.spy()
    ItemsWithMocks = ItemsInjector({
      '../user/UserService': {
        SESSION,
        logout: logoutHandler
      },
      './ItemService': {
        cardTypeMapping,
        removeLine: removeLineHandler,
        exportLinesAsCsv: exportLinesAsCsvHandler
      },
      '../../utils/piwik': {}
    })

    mockRouter = new Router({ routes: [
      { path: '/items/:id', name: 'visualisation_tems' },
      { path: '/items/:id/edit', name: 'edit_items' }
    ] })

    ItemsComponent = shallow(ItemsWithMocks, {
      router: mockRouter
    })

    SESSION.authenticated = true
  })

  it('should render navigation drawer', () => {
    expect(ItemsComponent.find('.export-link').html()).to.match(/app.menu.export/)
    expect(ItemsComponent.find('.logout-link').html()).to.match(/app.menu.logout/)
    expect(ItemsComponent.find('.about-link').html()).to.match(/app.menu.about/)
  })

  it('log out call logout ', () => {
    ItemsComponent.find('.logout-link').trigger('click')
    sinon.assert.calledWith(logoutHandler, sinon.match({}))
  })

  it('export call export ', () => {
    ItemsComponent.find('.export-link').trigger('click')
    sinon.assert.calledWith(exportLinesAsCsvHandler, sinon.match({}))
  })

  it('Test that beforeRouteEnter is executed - authenticated', async () => {
    const to = '/to'
    const from = '/from'
    const next = sinon.spy()

    ItemsComponent.vm.$options.beforeRouteEnter.forEach(beforeRouteEnter => {
      beforeRouteEnter(to, from, next)
    })

    sinon.assert.calledWith(next)
  })

  it('Test that beforeRouteEnter is executed - not authenticated', async () => {
    const to = '/to'
    const from = '/from'
    const next = sinon.spy()

    SESSION.authenticated = false

    ItemsComponent.vm.$options.beforeRouteEnter.forEach(beforeRouteEnter => {
      beforeRouteEnter(to, from, next)
    })

    sinon.assert.calledWith(next, '/login')
  })

  it('Check how the line is get by apollo', () => {
    expect(ItemsComponent.vm.$data).to.deep.equal({
      title: 'items:list.title',
      showOptions: false,
      drawer: true,
      dialog: {
        card: false,
        password: false,
        text: false
      },
      lines: []
    })
    ItemsComponent.vm.$options.apollo.lines.result.call(ItemsComponent.vm, ITEMS_LIST)
    expect(ItemsComponent.vm.$data).to.deep.equal({
      title: 'items:list.title',
      showOptions: false,
      drawer: true,
      dialog: {
        card: false,
        password: false,
        text: false,
        remove0: false,
        remove1: false,
        remove2: false,
        remove3: false
      },
      lines: []
    })
  })

  it('Test showing items on the list', done => {
    ItemsComponent.setData({
      title: 'items:list.title',
      showOptions: false,
      dialog: {
        card: false,
        password: false,
        text: false,
        remove0: false,
        remove1: false,
        remove2: false,
        remove3: false
      },
      lines: ITEMS_LIST.data.lines
    })
    Vue.nextTick(() => {
      const groups = ItemsComponent.findAll('.group-title')
      const groupsName = []
      expect(groups).to.have.lengthOf(2)
      for (let i = 0; i < groups.length; i++) {
        groupsName.push(groups.at(i).text())
      }
      expect(groupsName).to.deep.equal(['titi', 'toto'])

      done()
    })
  })

  it('Test filter of items', async () => {
    ItemsComponent.setData({
      title: 'items:list.title',
      showOptions: false,
      drawer: true,
      dialog: {card: false, password: false, text: false, remove0: false, remove1: false, remove2: false, remove3: false},
      lines: ITEMS_LIST.data.lines
    })

    ItemsComponent.vm.search('Carte')

    await timeout(500)
    await Vue.nextTick()

    expect(mockRouter.currentRoute.path).to.equal('/items')
    expect(mockRouter.currentRoute.query).to.deep.equal({q: 'Carte'})

    ItemsComponent.setProps(mockRouter.currentRoute.query)

    const groups = ItemsComponent.findAll('.group-title')
    const lines = ItemsComponent.findAll('.line-title')
    expect(groups).to.have.lengthOf(1)
    expect(lines).to.have.lengthOf(1)
  })

  it('Test card type mapping', () => {
    expect(ItemsComponent.vm.cardType()).to.equal(cardTypeMapping['text'])
  })

  it('Click on the remove button', async () => {
    ItemsComponent.setData({
      title: 'items:list.title',
      showOptions: false,
      dialog: {remove0: false, remove1: false, remove2: false, remove3: false},
      lines: ITEMS_LIST.data.lines
    })

    await Vue.nextTick()
    ItemsComponent.find('.item-delete-btn').trigger('click')
    await Vue.nextTick()
    ItemsComponent.find('.delete-btn').trigger('click')
    await Vue.nextTick()
    sinon.assert.calledWith(removeLineHandler, sinon.match({}, '57fa53b5d3cd8c0013ac93ff'))
  })

  it('Click on the detail item', async () => {
    ItemsComponent.setData({
      title: 'items:list.title',
      showOptions: false,
      dialog: {remove0: false, remove1: false, remove2: false, remove3: false},
      lines: ITEMS_LIST.data.lines
    })

    await Vue.nextTick()
    ItemsComponent.find('.line-title').trigger('click')
    await Vue.nextTick()
    expect(mockRouter.currentRoute.path).to.equal('/items/57fa53b5d3cd8c0013ac93ff')
  })
})

function timeout (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
