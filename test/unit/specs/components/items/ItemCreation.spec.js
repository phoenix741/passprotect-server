import { shallow } from 'vue-test-utils'
import sinon from 'sinon'
import Router from 'vue-router'
import ItemCreationInjector from '!!vue-loader?inject!@/components/items/ItemCreation.vue' // eslint-disable-line

describe('ItemCreation.vue', () => {
  let ItemCreationComponent, ItemCreationWithMocks, mockRouter
  const SESSION = {
    authenticated: true,
    clearKey: 'ee958f6809e430c9b8ff10b3cbec138f9150e0af1a00557144825fd5011e82ab'
  }

  beforeEach(() => {
    ItemCreationWithMocks = ItemCreationInjector({
      '../user/UserService': {SESSION},
      '../../utils/piwik': {}
    })

    mockRouter = new Router({ routes: [
      { path: '/items/:id/create', name: 'creation' }
    ] })

    ItemCreationComponent = shallow(ItemCreationWithMocks, {
      router: mockRouter,
      propsData: {
        type: 'text'
      }
    })

    SESSION.authenticated = true
  })

  it('Test that beforeRouteEnter is executed - authenticated', () => {
    const to = '/to'
    const from = '/from'
    const next = sinon.spy()

    ItemCreationComponent.vm.$options.beforeRouteEnter.forEach(beforeRouteEnter => {
      beforeRouteEnter(to, from, next)
    })

    sinon.assert.calledWith(next)
  })

  it('Test that beforeRouteEnter is executed - not authenticated', () => {
    const to = '/to'
    const from = '/from'
    const next = sinon.spy()

    SESSION.authenticated = false

    ItemCreationComponent.vm.$options.beforeRouteEnter.forEach(beforeRouteEnter => {
      beforeRouteEnter(to, from, next)
    })

    sinon.assert.calledWith(next, '/login')
  })
})
