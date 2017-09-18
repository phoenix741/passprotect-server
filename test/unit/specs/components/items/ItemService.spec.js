import sinon from 'sinon'
import { expect } from 'chai'
import { updateLine, removeLine, encryptLine, decryptLine, generate, exportLinesAsCsv } from '@/components/items/ItemService'
import { SESSION } from '@/components/user/UserService'

describe('ItemService.js', () => {
  const responseUpdateLine = {
    data: {
      createUpdateLine: {
        _id: 1,
        group: 'group'
      }
    }
  }
  const responseRemoveLine = {
    data: {
      removeLine: {

      }
    }
  }
  const responseLinesWithDetail = {
    data: {
      lines: [
        { _id: '57fa5386d3cd8c0013ac93fd', type: 'card', label: 'Carte bancaire', encryption: { salt: '05cbd1aff29fe0b1', informations: { content: '3381e7cad1f8b685e6571b3a5b38a6f59fb7eebbc7dfdc4b6ca463c866dc1991abd4cb1459f5b3822dfd2a774ceb9e588e7e990849a005a1b621c7a3fff7b5a830c9dcbe4b7af99b2a4dcc2cf77a36c766845b6d35bcfabe66e05c9847e466d1c124fd72f8797b9bf931500e3a6a7d9214da8fd0d84dbbba2099aba463e592f5cc25', authTag: 'd7d713bd3fcf90ea33ccfd7a68c3f0e8' } }, user: 'demo', group: 'toto' },
        { _id: '57fa539bd3cd8c0013ac93fe', type: 'password', label: 'Mon mot de passe', encryption: { informations: { content: '38f2a032e43d2484cbefd2eb8bc352c4fdb058132d0b28fae1187d00d43bd2b80004e1cf20c92aff912780068514657c8d70d8d204b386dab56d4a55c5fdd98ab6593daedba83f36216fe8ecb05a', authTag: '5ee4d04349d37f56ef8ee4cc88191868' }, salt: 'ccf13c80621edec6' }, user: 'demo' }
      ]
    }
  }

  describe('#updateLine', () => {
    let context, line, store
    beforeEach(() => {
      line = {
        _id: 1,
        group: 'group'
      }
      context = {
        $apollo: {
          mutate: sinon.stub().callsFake(async function (object) {
            object.update(store, responseUpdateLine)
            return responseUpdateLine
          })
        }
      }
    })

    it('Update the line, no error, no line', async () => {
      const lines = []
      const groups = []
      store = {
        readQuery: sinon.stub()
          .onFirstCall().returns({ lines })
          .onSecondCall().returns({ groups }),
        writeQuery: sinon.stub().returns()
      }

      await updateLine(context, line)

      expect(lines).to.deep.equal([{_id: 1, group: 'group'}])
      expect(groups).to.deep.equal(['group'])
      expect(context.error).to.be.an('undefined')
    })

    it('Update the line, no error, no line', async () => {
      const lines = [{_id: 1, group: 'xxx'}]
      const groups = ['group']
      store = {
        readQuery: sinon.stub()
          .onFirstCall().returns({ lines })
          .onSecondCall().returns({ groups }),
        writeQuery: sinon.stub().returns()
      }

      await updateLine(context, line)

      expect(lines).to.deep.equal(lines)
      expect(groups).to.deep.equal(['group'])
      expect(context.error).to.be.an('undefined')
    })

    it('Update the line, with functional error', async () => {
      context.$apollo.mutate = sinon.stub().returns(Promise.resolve({data: {createUpdateLine: {errors: [{fieldName: 'fieldName', message: 'message'}]}}}))
      await updateLine(context, line)
      expect(context.error).to.be.an('error')
    })

    it('Update the line, with error', async () => {
      context.$apollo.mutate = sinon.stub().returns(Promise.reject(new Error('error')))
      await updateLine(context, line)
      expect(context.error).to.be.an('error')
    })
  })

  describe('#removeLine', () => {
    let context, lineId, store
    beforeEach(() => {
      lineId = 1
      context = {
        $apollo: {
          mutate: sinon.stub().callsFake(async function (object) {
            object.update(store, responseRemoveLine)
            return responseRemoveLine
          })
        }
      }
    })

    it('Remove the line, no error', async () => {
      const lines = [{_id: 1, group: 'group'}]
      store = {
        readQuery: sinon.stub().returns({ lines }),
        writeQuery: sinon.stub().returns()
      }

      await removeLine(context, lineId)

      expect(lines).to.deep.equal([])
      expect(context.error).to.be.an('undefined')
    })

    it('Remove the line, no error, length = 0', async () => {
      const NO_ERROR = {data: {removeLine: {errors: []}}}
      context.$apollo.mutate = sinon.stub().callsFake(async function (object) {
        object.update(store, NO_ERROR)
        return NO_ERROR
      })

      const lines = [{_id: 1, group: 'group'}]
      store = {
        readQuery: sinon.stub().returns({ lines }),
        writeQuery: sinon.stub().returns()
      }

      await removeLine(context, lineId)

      expect(lines).to.deep.equal([])
      expect(context.error).to.be.an('undefined')
    })

    it('Update the line, with functional error', async () => {
      const NO_ERROR = {data: {removeLine: {errors: [{fieldName: 'fieldName', message: 'message'}]}}}
      context.$apollo.mutate = sinon.stub().callsFake(async function (object) {
        object.update(store, NO_ERROR)
        return NO_ERROR
      })
      await removeLine(context, lineId)
      expect(context.error).to.be.an('error')
    })

    it('Update the line, with error', async () => {
      context.$apollo.mutate = sinon.stub().returns(Promise.reject(new Error('error')))
      await removeLine(context, lineId)
      expect(context.error).to.be.an('error')
    })
  })

  describe('#encryptLine', () => {
    beforeEach(() => {
      SESSION.clearKey = 'clearKey'
    })

    afterEach(() => {
      delete SESSION.clearKey
    })

    it('encrypt / decrypt', async () => {
      const clearInformation = {
        cardType: 'VISA',
        cardNumber: '1234 5678 9012 1234'
      }
      const cryptedInformation = await encryptLine(clearInformation)
      const line = {
        type: 'card',
        encryption: cryptedInformation
      }

      const decryptedInformation = await decryptLine(line)
      expect(decryptedInformation).to.deep.equal({
        group: '',
        type: '',
        nameOnCard: '',
        cardNumber: '1234 5678 9012 1234',
        cvv: '',
        expiry: '',
        code: '',
        notes: '',
        cardType: 'VISA'
      })
    })
  })

  describe('#decryptLine', () => {
    it('empty lines', async () => {
      const empty = {group: '', type: '', nameOnCard: '', cardNumber: '', cvv: '', expiry: '', code: '', notes: ''}
      const info1 = await decryptLine({type: 'card'})
      const info2 = await decryptLine({type: 'card', encryption: {}})

      expect(info1).to.deep.equal(empty)
      expect(info2).to.deep.equal(empty)
    })
  })

  describe('#generate', () => {
    it('generate a password', async () => {
      const password = await generate()
      expect(password.length).to.equal(16)
      expect(password).to.match(/[a-zA-Z0-9!"#$%&\\'()*+,-./:;<=>?@\[\\\]\^_`{|}~]+/) // eslint-disable-line
    })
  })

  describe('#exportLinesAsCsv', () => {
    beforeEach(() => {
      SESSION.clearKey = 'ee958f6809e430c9b8ff10b3cbec138f9150e0af1a00557144825fd5011e82ab'
    })

    afterEach(() => {
      delete SESSION.clearKey
    })

    let context
    beforeEach(() => {
      context = {
        $apollo: {
          addSmartQuery: sinon.stub().callsFake(function (name, object) {
            object.result(responseLinesWithDetail)
          }),
          queries: {
            lines: {
              stop: sinon.stub()
            }
          }
        }
      }
    })

    it('Export, no error', async () => {
      await exportLinesAsCsv(context)
    })

    it('Update the line, with error', () => {
      context.$apollo.addSmartQuery = sinon.stub().callsFake(function (name, object) {
        object.error(new Error('error'))
      })

      return exportLinesAsCsv(context).then(function () {
        throw new Error('should error')
      }, () => {})
    })
  })
})
