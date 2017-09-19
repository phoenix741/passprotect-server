import {isString, isDate} from 'lodash'
import {promise as db} from '../utils/db'

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

  if (isString(filter.user)) {
    find.user = filter.user
  }
  if (isDate(filter.earliest)) {
    find.updatedAt = { '$gte': filter.earliest }
  }

  return (await db).collection('transactions').find(find).sort({ updatedAt: 1 }).toArray()
}

export async function createTransaction (transaction) {
  try {
    const doc = await (await db).collection('transactions').insert(transaction)
    return doc.ops[0]
  } catch (err) {
    processMongoException(err)
  }
}
