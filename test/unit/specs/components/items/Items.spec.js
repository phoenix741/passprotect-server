import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Router from 'vue-router'
import Vue from 'vue'
import ItemsInjector from '!!vue-loader?inject!@/components/items/Items.vue' // eslint-disable-line
import {cardTypeMapping} from '@/components/items/ItemService'

describe('Items.vue', () => {
  let ItemsComponent, ItemsWithMocks, mockRouter, removeLineHandler
  const SESSION = {
    authenticated: true
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
    removeLineHandler = sinon.spy()
    ItemsWithMocks = ItemsInjector({
      '../user/UserService': {
        SESSION
      },
      './ItemService': {
        cardTypeMapping,
        removeLine: removeLineHandler
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

  it('should render correct contents', async () => {

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
      dialog: {},
      filter: '',
      lines: []
    })
    ItemsComponent.vm.$options.apollo.lines.result.call(ItemsComponent.vm, ITEMS_LIST)
    expect(ItemsComponent.vm.$data).to.deep.equal({
      title: 'items:list.title',
      showOptions: false,
      dialog: {
        remove0: false,
        remove1: false,
        remove2: false,
        remove3: false
      },
      filter: '',
      lines: []
    })
  })

  it('Test showing items on the list', done => {
    ItemsComponent.setData({
      title: 'items:list.title',
      showOptions: false,
      dialog: {
        remove0: false,
        remove1: false,
        remove2: false,
        remove3: false
      },
      filter: '',
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
      dialog: {remove0: false, remove1: false, remove2: false, remove3: false},
      filter: '',
      lines: ITEMS_LIST.data.lines
    })

    ItemsComponent.vm.search('Carte')

    await timeout(500)
    await Vue.nextTick()

    const groups = ItemsComponent.findAll('.group-title')
    const lines = ItemsComponent.findAll('.line-title')
    expect(groups).to.have.lengthOf(1)
    expect(lines).to.have.lengthOf(1)
  })

  it('Test card type mapping', () => {
    expect(ItemsComponent.vm.cardType()).to.equal(cardTypeMapping['text'])
  })

  it('Test Click on create credit card', async () => {
    ItemsComponent.setData({
      title: 'items:list.title',
      showOptions: false,
      dialog: {remove0: false, remove1: false, remove2: false, remove3: false},
      filter: '',
      lines: ITEMS_LIST.data.lines
    })

    ItemsComponent.find('#items-add-button').trigger('click')
    await Vue.nextTick()
    ItemsComponent.find('#items-add-card-button').trigger('click')
    await Vue.nextTick()

    expect(mockRouter.currentRoute.path).to.equal('/items/type/card')
  })

  it('Test Click on create fingerprint', async () => {
    ItemsComponent.setData({
      title: 'items:list.title',
      showOptions: false,
      dialog: {remove0: false, remove1: false, remove2: false, remove3: false},
      filter: '',
      lines: ITEMS_LIST.data.lines
    })

    ItemsComponent.find('#items-add-button').trigger('click')
    await Vue.nextTick()
    ItemsComponent.find('#items-add-password-button').trigger('click')
    await Vue.nextTick()
    expect(mockRouter.currentRoute.path).to.equal('/items/type/password')
  })

  it('Test Click on create text', async () => {
    ItemsComponent.setData({
      title: 'items:list.title',
      showOptions: false,
      dialog: {remove0: false, remove1: false, remove2: false, remove3: false},
      filter: '',
      lines: ITEMS_LIST.data.lines
    })

    ItemsComponent.find('#items-add-button').trigger('click')
    await Vue.nextTick()
    ItemsComponent.find('#items-add-text-button').trigger('click')
    await Vue.nextTick()
    expect(mockRouter.currentRoute.path).to.equal('/items/type/text')
  })

  it('Click on the remove button', async () => {
    ItemsComponent.setData({
      title: 'items:list.title',
      showOptions: false,
      dialog: {remove0: false, remove1: false, remove2: false, remove3: false},
      filter: '',
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
      filter: '',
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
