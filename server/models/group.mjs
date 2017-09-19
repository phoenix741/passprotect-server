import {isString} from 'lodash'
import {promise as db} from '../utils/db'

export async function getGroups (filter, sort) {
  const find = {}

  if (isString(filter.user)) {
    find.user = filter.user
  }

  return (await db).collection('walletlines').distinct('group', find)
}
