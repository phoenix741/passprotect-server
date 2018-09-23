import { checkPermission } from '../utils/authentification'
import { getTransactions } from '../services/transaction'
import { pubsub, TRANSACTION_ADDED_TOPIC } from '../services/subscriptions'
import { withFilter } from 'graphql-subscriptions'
import moment from 'moment'

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
