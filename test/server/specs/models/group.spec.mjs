import { getGroups } from '../../../../server/models/group'
import { expect } from 'chai'

describe('models', () => {
  describe('group.js', () => {
    it('#getGroups', async () => {
      await getGroups({}, {})
    })
  })
})
