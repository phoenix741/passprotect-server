'use strict';

import { flatten, merge } from 'lodash';
import fs from 'fs';
import path from 'path';
import debug from 'debug';
import {authenticate} from 'server/utils/passport';
import { graphqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { SubscriptionManager } from 'graphql-subscriptions';

import {pubsub} from 'server/services/subscriptions';

import {typeDefs as userTypeDefs, resolvers as userResolvers} from './user';
import {typeDefs as lineTypeDefs, resolvers as lineResolvers} from './line';
import {typeDefs as sessionTypeDefs, resolvers as sessionResolvers} from './session';
import {typeDefs as transactionTypeDefs, resolvers as transactionResolvers, setupFunctions as transactionSetupFunctions} from './transaction';

const log = debug('App:Controllers:GraphQL');

log('Load common type definitions');
const typeDefs = flatten([
	fs.readFileSync(path.join(__dirname, '..', '..', 'common', 'graphql', 'common.graphql'), 'utf-8'),
	userTypeDefs,
	lineTypeDefs,
	sessionTypeDefs,
	transactionTypeDefs
]);

const GraphQLScalarDate = new GraphQLScalarType({
	name: 'Date',
	description: 'Date in format Timestamp',
	serialize(value) {
		return value.getTime();
	},
	parseValue(value) {
		return new Date(value);
	},
	parseLiteral(ast) {
		if (ast.kind === Kind.INT) {
			return parseInt(ast.value, 10); // ast value is always in string format
		}
		return null;
	}
});

const resolvers = merge({Date: GraphQLScalarDate}, userResolvers, lineResolvers, sessionResolvers, transactionResolvers);

const setupFunctions = merge(transactionSetupFunctions);

log('Create the graphql schema');
const schema = makeExecutableSchema({typeDefs, resolvers, logger: {log}});

export const subscriptionManager = new SubscriptionManager({schema, pubsub, setupFunctions});

const graphqlRouter = graphqlExpress((req, res) => ({
	schema,
	context: {
		user: req.user,
		res
	}
}));

export default [authenticate(), graphqlRouter];
