import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Vue from 'vue'
import Router from 'vue-router'
import ItemVisualisationInjector from '!!vue-loader?inject!@/components/items/ItemVisualisation.vue' // eslint-disable-line
import {cardTypeMapping} from '@/components/items/ItemService'

describe('ItemVisualisation.vue', () => {
  let ItemVisualisationComponent, ItemVisualisationWithMocks, copyHandler, mockRouter
  const SESSION = {
    authenticated: true,
    clearKey: 'ee958f6809e430c9b8ff10b3cbec138f9150e0af1a00557144825fd5011e82ab'
  }
  const decryptedLine = {group: '', type: 'VISA', nameOnCard: 'MON NOM', cardNumber: '12345678910', cvv: '123', expiry: '12/20', code: '1234', notes: ''}
  const CARD_INFORMATION = {
    title: 'items:item.title_visualisation',
    line: {
      _id: '57fa5386d3cd8c0013ac93fd',
      type: 'card',
      label: 'Carte bancaire',
      encryption: {
        salt: '05cbd1aff29fe0b1',
        informations: {
          content: '3381e7cad1f8b685e6571b3a5b38a6f59fb7eebbc7dfdc4b6ca463c866dc1991abd4cb1459f5b3822dfd2a774ceb9e588e7e990849a005a1b621c7a3fff7b5a830c9dcbe4b7af99b2a4dcc2cf77a36c766845b6d35bcfabe66e05c9847e466d1c124fd72f8797b9bf931500e3a6a7d9214da8fd0d84dbbba2099aba463e592f5cc25',
          authTag: 'd7d713bd3fcf90ea33ccfd7a68c3f0e8'
        }
      },
      user: 'demo',
      group: 'toto'
    },
    clearInformation: {}
  }

  beforeEach(() => {
    copyHandler = sinon.spy()
    ItemVisualisationWithMocks = ItemVisualisationInjector({
      'clipboard-copy': copyHandler,
      '../user/UserService': {
        SESSION
      },
      './ItemService': {
        cardTypeMapping,
        decryptLine: async () => decryptedLine
      },
      '../../utils/piwik': {}
    })

    mockRouter = new Router({ routes: [
      { path: '/items/:id', name: 'visualisation_tems' },
      { path: '/items/:id/edit', name: 'edit_items' }
    ] })

    ItemVisualisationComponent = shallow(ItemVisualisationWithMocks, {
      router: mockRouter
    })

    SESSION.authenticated = true
  })

  it('should render correct contents', async () => {
    ItemVisualisationComponent.setData(CARD_INFORMATION)
    // Call method manually because wather is async
    await ItemVisualisationComponent.vm.decryptClearInformation(CARD_INFORMATION.line)
    await Vue.nextTick()

    expect(ItemVisualisationComponent.find('#title-label').text()).to.equal('items:list.type.card')
    expect(ItemVisualisationComponent.find('#label-text').text()).to.equal('Carte bancaire')
    expect(ItemVisualisationComponent.find('#type-of-card-text').text()).to.equal('VISA')
    expect(ItemVisualisationComponent.find('#name-on-card-text').text()).to.equal('MON NOM')
    expect(ItemVisualisationComponent.find('#card-number-text').text()).to.equal('12345678910')
    expect(ItemVisualisationComponent.find('#cvv-text').text()).to.equal('123')
    expect(ItemVisualisationComponent.find('#code-text').text()).to.equal('1234')
    expect(ItemVisualisationComponent.find('#expiry-text').text()).to.equal('12/20')
  })

  it('should copy to clipbloard', async () => {
    ItemVisualisationComponent.setData(CARD_INFORMATION)
    // Call method manually because wather is async
    await ItemVisualisationComponent.vm.decryptClearInformation(CARD_INFORMATION.line)
    await Vue.nextTick()

    const buttons = ItemVisualisationComponent.findAll('.copy-button')
    for (let i = 0; i < buttons.length; i++) {
      buttons.at(i).trigger('click')
      sinon.assert.calledOnce(copyHandler)
      copyHandler.reset()
    }
  })

  it('Test that beforeRouteEnter is executed - authenticated', async () => {
    const to = '/to'
    const from = '/from'
    const next = sinon.spy()

    ItemVisualisationComponent.vm.$options.beforeRouteEnter.forEach(beforeRouteEnter => {
      beforeRouteEnter(to, from, next)
    })

    sinon.assert.calledWith(next)
  })

  it('Test that beforeRouteEnter is executed - not authenticated', async () => {
    const to = '/to'
    const from = '/from'
    const next = sinon.spy()

    SESSION.authenticated = false

    ItemVisualisationComponent.vm.$options.beforeRouteEnter.forEach(beforeRouteEnter => {
      beforeRouteEnter(to, from, next)
    })

    sinon.assert.calledWith(next, '/login')
  })

  it('Check how the line is get by apollo', function () {
    expect(ItemVisualisationComponent.vm.$options.apollo.line.variables.call({id: 'id'})).to.deep.equal({id: 'id'})
  })
})
