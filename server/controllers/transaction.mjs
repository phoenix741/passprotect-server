import { checkPermission } from '../utils/authentification'
import { getTransactions } from '../services/transaction'
import { pubsub, TRANSACTION_ADDED_TOPIC } from '../services/subscriptions'
import { withFilter } from 'graphql-subscriptions'
import moment from 'moment'
import fs from 'fs'
import path from 'path'
import debug from 'debug'

const log = debug('App:Controllers:Session')

log('Load transaction type definition')
export const typeDefs = [
  fs.readFileSync(path.join(__dirname, '..', '..', 'common', 'graphql', 'transaction.graphql'), 'utf-8')
]

export const resolvers = {
  RootQuery: {
    async transactions (obj, { earliest }, { user }) {
      checkPermission(user)
      earliest = moment(earliest).toDate()

      return getTransactions(user, { earliest })
    }
  },

  RootSubscription: {
    transactionAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator(TRANSACTION_ADDED_TOPIC), (payload, context) => {
        return payload.transactionAdded.user === context.user._id
      })
    }
  }
}
