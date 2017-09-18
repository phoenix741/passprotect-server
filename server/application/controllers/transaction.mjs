import {checkPermission} from '../utils/passport'
import {getTransactions} from '../services/transaction'
import moment from 'moment'
import fs from 'fs'
import path from 'path'
import debug from 'debug'

const log = debug('App:Controllers:Session')

log('Load transaction type definition')
export const typeDefs = [
  fs.readFileSync(path.join(__dirname, '..', '..', '..', 'common', 'graphql', 'transaction.graphql'), 'utf-8')
]

export const resolvers = {
  RootQuery: {
    transactions (obj, {earliest}, {user}) {
      earliest = moment(earliest).toDate()

      return checkPermission(user).then(() => getTransactions(user, {earliest}))
    }
  },

  RootSubscription: {
    transactionAdded (transaction) {
      return transaction
    }
  }
}

export const setupFunctions = {
  transactionAdded ({context}) {
    return {
      transactionAdded: {
        filter: transaction => transaction.user === context.user._id
      }
    }
  }
}
