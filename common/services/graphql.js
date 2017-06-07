'use strict';

const { flatten } = require('lodash');
const fs = require('fs');
const path = require('path');
const { makeExecutableSchema } = require('graphql-tools');
const { graphql, introspectionQuery } = require('graphql');

const typeDefs = flatten([
	fs.readFileSync(path.join(__dirname, '..', 'graphql', 'common.graphql'), 'utf-8'),
	fs.readFileSync(path.join(__dirname, '..', '..', 'common', 'graphql', 'user.graphql'), 'utf-8'),
	fs.readFileSync(path.join(__dirname, '..', '..', 'common', 'graphql', 'line.graphql'), 'utf-8'),
	fs.readFileSync(path.join(__dirname, '..', '..', 'common', 'graphql', 'session.graphql'), 'utf-8'),
	fs.readFileSync(path.join(__dirname, '..', '..', 'common', 'graphql', 'transaction.graphql'), 'utf-8')
]);

const schema = exports.schema = makeExecutableSchema({typeDefs});

exports.graphqlPromise = graphql(schema, introspectionQuery);
