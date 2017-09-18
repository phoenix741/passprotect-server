import {isString} from 'lodash'
import {promise as dbPromise} from '../utils/db'

export function getGroups (filter, sort) {
  const find = {}

  if (isString(filter.user)) {
    find.user = filter.user
  }

  return dbPromise.then(db => db.collection('walletlines').distinct('group', find))
}
