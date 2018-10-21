import _ from 'lodash'
import config from 'config'
import fs from 'fs'
import path from 'path'
import debug from 'debug'
import apolloServer from 'apollo-server'
import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

import { getUserFromPayload } from './authentification'

import { typeDefs as userTypeDefs, resolvers as userResolvers } from '../controllers/user'
import { typeDefs as lineTypeDefs, resolvers as lineResolvers } from '../controllers/line'
import { typeDefs as sessionTypeDefs, resolvers as sessionResolvers } from '../controllers/session'
import { typeDefs as transactionTypeDefs, resolvers as transactionResolvers } from '../controllers/transaction'

const log = debug('App:Controllers:GraphQL')
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const jwtOption = {
  secret: config.get('config.jwt.secret'),
  credentialsRequired: false,
  requestProperty: 'payload'
}

log('Load common type definitions')
const typeDefs = _.flatten([
  fs.readFileSync(path.join(__dirname, '..', 'graphql', 'common.graphql'), 'utf-8'),
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

const resolvers = _.merge({ Date: GraphQLScalarDate }, userResolvers, lineResolvers, sessionResolvers, transactionResolvers)

log('Start apollo server')
const server = new apolloServer.ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    let token;
    if (connection) {
      token = connection.context.Authorization
    } else {
      token = req.headers.authorization || ""
    }

    const user = await getUserFromPayload(token)

    return {
      user
    }
  },
  tracing: true
})

export function bootstrap () {
  log('Bootstrap apollo')
  server.listen().then(({ url, subscriptionsUrl }) => {
    log(`-> Server ready at ${url}`)
    log(`-> Subscriptions ready at ${subscriptionsUrl}`)
  })
}
