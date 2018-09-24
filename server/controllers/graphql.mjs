import { flatten, merge } from 'lodash'
import fs from 'fs'
import path from 'path'
import debug from 'debug'
import { graphqlExpress } from 'graphql-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

import { typeDefs as userTypeDefs, resolvers as userResolvers } from './user'
import { typeDefs as lineTypeDefs, resolvers as lineResolvers } from './line'
import { typeDefs as sessionTypeDefs, resolvers as sessionResolvers } from './session'
import { typeDefs as transactionTypeDefs, resolvers as transactionResolvers } from './transaction'

const log = debug('App:Controllers:GraphQL')

log('Load common type definitions')
const typeDefs = flatten([
  fs.readFileSync(path.join(__dirname, '..', '..', 'common', 'graphql', 'common.graphql'), 'utf-8'),
  userTypeDefs,
  lineTypeDefs,
  sessionTypeDefs,
  transactionTypeDefs
])

const GraphQLScalarDate = new GraphQLScalarType({
  name: 'Date',
  description: 'Date in format Timestamp',
  serialize (value) {
    return value.getTime()
  },
  parseValue (value) {
    return new Date(value)
  },
  parseLiteral (ast) {
    if (ast.kind === Kind.INT) {
      return parseInt(ast.value, 10) // ast value is always in string format
    }
    return null
  }
})

const resolvers = merge({ Date: GraphQLScalarDate }, userResolvers, lineResolvers, sessionResolvers, transactionResolvers)

log('Create the graphql schema')
export const schema = makeExecutableSchema({ typeDefs, resolvers, logger: { log } })

const graphqlRouter = graphqlExpress((req, res) => ({
  schema,
  context: {
    user: req.user,
    res
  }
}))

export default graphqlRouter
