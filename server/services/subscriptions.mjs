import apolloServer from 'apollo-server'

export const pubsub = new apolloServer.PubSub()

export const TRANSACTION_ADDED_TOPIC = 'transactionAdded'

/**
 * Publish a new transaction to applications.
 *
 * @param {Object} transaction Transaction object
 */
export function transactionAdded (transaction) {
  pubsub.publish(TRANSACTION_ADDED_TOPIC, transaction)
}
