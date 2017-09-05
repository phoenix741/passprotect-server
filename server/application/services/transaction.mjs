import debug from 'debug'

import crypto from 'crypto'
import {getTransactions as getTransactionsModel, createTransaction as createTransactionModel} from '../models/transaction'
import {transactionAdded} from '../services/subscriptions'

const log = debug('App:Service:LineTransaction')

export function getTransactions (user, params = {}) {
  log(`Get all transaction of the user ${user._id} after ${params.earliest}`)

  const filter = {}
  filter.user = user._id
  filter.earliest = params.earliest

  return getTransactionsModel(filter)
}

export function createTransaction (type, before, after) {
  const base = after || before
  if (!base) {
    return null
  }

  const transaction = {
    type,
    line: base._id,
    user: base.user,
    before: before,
    after: after,
    updatedAt: base.updatedAt,
    sha512: after && crypto.createHash('sha512').update(after.encryption.informations.content).digest('hex')
  }

  return createTransactionModel(transaction).tap(transactionAdded)
}
