import {isString} from 'lodash'
import {connection} from '../utils/db'

export async function getGroups (filter) {
  const find = {}

  if (isString(filter.user)) {
    find.user = filter.user
  }
  return (await connection()).collection('walletlines').distinct('group', find)
}
