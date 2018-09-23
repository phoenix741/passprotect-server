import debug from 'debug'
import { getGroups as getGroupsModel } from '../models/group'
import { compact } from 'lodash'

const log = debug('App:Service:Group')

export async function getGroups (user) {
  log('Get all groups from user', user._id)

  const filter = {}
  filter.user = user._id

  const sort = {}
  sort.group = 1

  const groups = await getGroupsModel(filter, sort)
  return compact(groups)
}
