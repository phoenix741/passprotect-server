/* global __GRAPHQL_SCHEMA__ */

import VueApollo from 'vue-apollo'
import { ApolloClient, createNetworkInterface, IntrospectionFragmentMatcher } from 'apollo-client'
import { getAuthHeader } from '../components/user/UserService'

const schema = __GRAPHQL_SCHEMA__

const networkInterface = createNetworkInterface({
  uri: '/api/graphql',
  transportBatching: true
})

networkInterface.use([{
  applyMiddleware (req, next) {
    req.options.headers = getAuthHeader()
    next()
  }
}])

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: schema.data
})

export const apolloClient = new ApolloClient({
  networkInterface,
  fragmentMatcher,
  connectToDevTools: true
})

export const apolloProvider = new VueApollo({defaultClient: apolloClient})
