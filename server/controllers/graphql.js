'use strict';

import _ from 'lodash';
import fs from 'fs';
import path from 'path'
import debug from 'debug';
import {authenticate} from 'server/utils/passport';
import moment from 'moment';
import { graphqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

import {getUsers,getUser} from 'server/services/user';
import {getLines,getLine} from 'server/services/line';
import {getTransactions} from 'server/services/transaction';

import {typeDefs as userTypeDefs, resolvers as userResolvers} from './user';
import {typeDefs as lineTypeDefs, resolvers as lineResolvers} from './line';
import {typeDefs as sessionTypeDefs, resolvers as sessionResolvers} from './session';
import {typeDefs as transactionTypeDefs, resolvers as transactionResolvers} from './transaction';

const log = debug('App:Controllers:GraphQL');

log('Load common type definitions');
const typeDefs = _.flatten([
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

const resolvers = _.merge({Date: GraphQLScalarDate}, userResolvers, lineResolvers, sessionResolvers, transactionResolvers);

log('Create the graphql schema');
const schema = makeExecutableSchema({typeDefs, resolvers, logger: {log}});

const graphqlRouter = graphqlExpress((req, res) => ({
	schema,
	context: {
		user: req.user,
		res
	}
}));

export default [authenticate(), graphqlRouter];

