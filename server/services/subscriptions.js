import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

/**
 * Publish a new transaction to applications.
 *
 * @param {Object} transaction Transaction object
 */
export function transactionAdded(transaction) {
	pubsub.publish('transactionAdded', transaction);
}
