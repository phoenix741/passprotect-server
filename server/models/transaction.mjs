import _ from 'lodash'
import { connection } from '../utils/db'

import { processMongoException } from './exception'

/*
 * Model of a wallet line contains :
 *        _id: {type: ObjectId},
 *        user: {type: String},
 *        label: {type: String},
 *        note: {type: encrypted}
 *
 * And all other informations that a user want to store in the wallet line (depending on the wallet).
 */
export async function getTransactions (filter) {
  const find = {}

  if (_.isString(filter.user)) {
    find.user = filter.user
  }
  if (_.isDate(filter.earliest)) {
    find.updatedAt = { '$gte': filter.earliest }
  }

  return (await connection()).collection('transactions').find(find).sort({ updatedAt: 1 }).toArray()
}

export async function createTransaction (transaction) {
  try {
    const doc = await (await connection()).collection('transactions').insert(transaction)
    return doc.ops[0]
  } catch (err) {
    processMongoException(err)
  }
}
