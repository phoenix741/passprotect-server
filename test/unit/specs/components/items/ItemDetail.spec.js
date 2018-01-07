import { shallow } from 'vue-test-utils'
import sinon from 'sinon'
import { expect } from 'chai'
import Vue from 'vue'
import Router from 'vue-router'
import ItemDetailInjector from '!!vue-loader?inject!@/components/items/ItemDetail.vue' // eslint-disable-line
import {cardTypeMapping} from '@/components/items/ItemService'

describe('ItemDetail.vue', () => {
  let ItemDetailComponent, ItemDetailWithMocks, mockRouter, updateLineHandler, generateHandler
  const DECRYPTED_LINE = {group: '', type: 'VISA', nameOnCard: 'MON NOM', cardNumber: '12345678910', cvv: '123', expiry: '12/20', code: '1234', notes: ''}
  const ENCRYPTED_LINE = {
    _id: '57fa5386d3cd8c0013ac93fd',
    type: 'card',
    label: 'Carte bancaire',
    encryption: {
      salt: '05cbd1aff29fe0b1',
      informations: {
        content: '3381e7cad1f8b685e6571b3a5b38a6f59fb7eebbc7dfdc4b6ca463c866dc1991abd4cb1459f5b3822dfd2a774ceb9e588e7e990849a005a1b621c7a3fff7b5a830c9dcbe4b7af99b2a4dcc2cf77a36c766845b6d35bcfabe66e05c9847e466d1c124fd72f8797b9bf931500e3a6a7d9214da8fd0d84dbbba2099aba463e592f5cc25',
        authTag: 'd7d713bd3fcf90ea33ccfd7a68c3f0e8'
      }
    }
  }
  const ENCRYPTED_PASSWORD = {
    _id: '57fa5386d3cd8c0013ac93fd',
    type: 'password',
    label: 'Pasword',
    encryption: {
      salt: '05cbd1aff29fe0b1',
      informations: {
        content: '3381e7cad1f8b685e6571b3a5b38a6f59fb7eebbc7dfdc4b6ca463c866dc1991abd4cb1459f5b3822dfd2a774ceb9e588e7e990849a005a1b621c7a3fff7b5a830c9dcbe4b7af99b2a4dcc2cf77a36c766845b6d35bcfabe66e05c9847e466d1c124fd72f8797b9bf931500e3a6a7d9214da8fd0d84dbbba2099aba463e592f5cc25',
        authTag: 'd7d713bd3fcf90ea33ccfd7a68c3f0e8'
      }
    }
  }

  beforeEach(() => {
    updateLineHandler = sinon.spy()
    generateHandler = sinon.mock().callsFake(async () => 'passwordtest')
    ItemDetailWithMocks = ItemDetailInjector({
      './ItemService': {
        cardTypeMapping,
        decryptLine: () => DECRYPTED_LINE,
        updateLine: updateLineHandler,
        generate: generateHandler,
        encryptLine: () => ENCRYPTED_LINE.encryption
      }
    })

    mockRouter = new Router({ routes: [
      { path: '/items/:id/modification', name: 'modification' }
    ] })

    ItemDetailComponent = shallow(ItemDetailWithMocks, {
      router: mockRouter,
      propsData: {
        line: ENCRYPTED_LINE
      }
    })
  })

  it('Check mount without type', async () => {
    ItemDetailComponent = shallow(ItemDetailWithMocks, {
      router: mockRouter,
      propsData: {
        line: {}
      }
    })

    // Call method manually because wather is async
    await ItemDetailComponent.vm.decryptClearInformation({})
    await Vue.nextTick()

    expect(ItemDetailComponent.vm.$data.lineToModify).to.deep.equal({})
    expect(ItemDetailComponent.vm.$data.clearInformation).to.equal(DECRYPTED_LINE)
  })

  it('Test the content of the vue', async () => {
    const data = ItemDetailComponent.vm.$data
    data.groups = ['group1', 'group2']
    ItemDetailComponent.setData(data)

    // Call method manually because wather is async
    await ItemDetailComponent.vm.decryptClearInformation(ENCRYPTED_LINE)
    await Vue.nextTick()

    expect(ItemDetailComponent.find('#title-label').text()).to.equal('items:list.type.card')
    expect(ItemDetailComponent.find('#label-input').element.value).to.equal('Carte bancaire')
    expect(ItemDetailComponent.find('#name-on-card-input').element.value).to.equal('MON NOM')
    expect(ItemDetailComponent.find('#card-number-input').element.value).to.equal('12345678910')
    expect(ItemDetailComponent.find('#cvv-input').element.value).to.equal('123')
    expect(ItemDetailComponent.find('#code-input').element.value).to.equal('1234')
    expect(ItemDetailComponent.find('#expiry-input').element.value).to.equal('12/20')

    const groupsElement = ItemDetailComponent.findAll('.list__tile--link')
    const groups = []
    for (let i = 0; i < groupsElement.length; i++) {
      groups.push(groupsElement.at(i).text())
    }
    expect(groups).to.deep.equal(['group1', 'group2', 'items:item.form.group.newItem', 'items:item.form.type.options'])
  })

  it('Test validation of input label', async () => {
    const data = {
      lineToModify: {
        label: ''
      },
      clearInformation: {},
      typeOfCard: ['VISA'],
      groups: [],
      newGroup: ''
    }

    ItemDetailComponent.setData(data)
    ItemDetailComponent.find('#label-input').trigger('blur')

    await Vue.nextTick()
    await ItemDetailComponent.vm.submit()

    expect(ItemDetailComponent.html()).to.match(/The items:item.form.label.field field is required./)
    sinon.assert.notCalled(updateLineHandler)
  })

  it('Generate a password', async () => {
    ItemDetailComponent = shallow(ItemDetailWithMocks, {
      router: mockRouter,
      propsData: {
        line: ENCRYPTED_PASSWORD
      }
    })

    // Call method manually because wather is async
    await ItemDetailComponent.vm.decryptClearInformation(ENCRYPTED_LINE)
    await Vue.nextTick()

    ItemDetailComponent.find('#generate-password').trigger('click')
    await Vue.nextTick()

    sinon.assert.calledWith(generateHandler)
    expect(ItemDetailComponent.vm.$data.clearInformation.password).to.equal('passwordtest')
  })

  it('Submit the form - existing group', async () => {
    // Call method manually because wather is async
    await ItemDetailComponent.vm.decryptClearInformation(ENCRYPTED_LINE)
    await Vue.nextTick()

    await ItemDetailComponent.vm.submit()

    sinon.assert.calledWith(updateLineHandler, sinon.match({}), ENCRYPTED_LINE)
    expect(ItemDetailComponent.emitted().close.length).to.equal(1)
  })

  it('Submit the form - new group', async () => {
    const data = ItemDetailComponent.vm.$data
    data.newGroup = 'newGroup'
    ItemDetailComponent.setData(data)

    // Call method manually because wather is async
    await ItemDetailComponent.vm.decryptClearInformation(ENCRYPTED_LINE)
    await Vue.nextTick()

    await ItemDetailComponent.vm.submit()

    const newLine = Object.assign({}, ENCRYPTED_LINE)
    newLine.group = 'newGroup'

    sinon.assert.calledWith(updateLineHandler, sinon.match({}), newLine)
    expect(ItemDetailComponent.emitted().close.length).to.equal(1)
  })
})
