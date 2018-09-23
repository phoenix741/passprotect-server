import { merge } from 'lodash'
import { resolvers as commonResolvers } from './controllers/graphql'
import { resolvers as userResolvers } from './controllers/user'
import { resolvers as lineResolvers } from './controllers/line'
import { resolvers as sessionResolvers } from './controllers/session'
import { resolvers as transactionResolvers } from './controllers/transaction'

export default merge({}, commonResolvers, userResolvers, lineResolvers, sessionResolvers, transactionResolvers)
