import { shallow } from 'vue-test-utils'
import sinon from 'sinon'
import Router from 'vue-router'
import ItemModificationInjector from '!!vue-loader?inject!@/components/items/ItemModification.vue' // eslint-disable-line

describe('ItemModification.vue', () => {
  let ItemModificationComponent, ItemModificationWithMocks, mockRouter
  const SESSION = {
    authenticated: true,
    clearKey: 'ee958f6809e430c9b8ff10b3cbec138f9150e0af1a00557144825fd5011e82ab'
  }

  beforeEach(() => {
    ItemModificationWithMocks = ItemModificationInjector({
      '../user/UserService': {SESSION},
      '../../utils/piwik': {}
    })

    mockRouter = new Router({ routes: [
      { path: '/items/:id/modification', name: 'modification' }
    ] })

    ItemModificationComponent = shallow(ItemModificationWithMocks, {
      router: mockRouter,
      propsData: {
        id: '57fa5386d3cd8c0013ac93fd'
      }
    })

    SESSION.authenticated = true
  })

  it('Test that beforeRouteEnter is executed - authenticated', () => {
    const to = '/to'
    const from = '/from'
    const next = sinon.spy()

    ItemModificationComponent.vm.$options.beforeRouteEnter.forEach(beforeRouteEnter => {
      beforeRouteEnter(to, from, next)
    })

    sinon.assert.calledWith(next)
  })

  it('Test that beforeRouteEnter is executed - not authenticated', () => {
    const to = '/to'
    const from = '/from'
    const next = sinon.spy()

    SESSION.authenticated = false

    ItemModificationComponent.vm.$options.beforeRouteEnter.forEach(beforeRouteEnter => {
      beforeRouteEnter(to, from, next)
    })

    sinon.assert.calledWith(next, '/login')
  })

  it('Check how the line is get by apollo', function () {
    expect(ItemModificationComponent.vm.$options.apollo.line.variables.call({id: 'id'})).to.deep.equal({id: 'id'})
  })
})
