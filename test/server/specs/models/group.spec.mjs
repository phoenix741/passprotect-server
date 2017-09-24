import { getGroups } from '../../../../server/models/group'
import * as db from '../../../../server/utils/db'
import { expect } from 'chai'
import sinon from 'sinon'

describe('models', () => {
  describe('group.js', () => {
    beforeEach(() => {
      sinon.stub(db, 'connection').callsFake(async () => {
        console.log('zzzzzzzzz')
        return {
          collection (collection) {
            expect(collection).to.equal('walletlines')
            return {
              distinct (group, filter) {
                expect(group).to.equal('group')
                expect(filter).to.deep.equal({user: 'myuser'})
              }
            }
          }
        }
      })
    })

    afterEach(() => {
      db.connection.restore()
    })

    it('#getGroups', async () => {
      await getGroups({
        user: 'myuser'
      })
    })
  })
})
