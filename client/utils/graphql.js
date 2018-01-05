/* global __GRAPHQL_SCHEMA__ */

import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink } from 'apollo-link'
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import { getAuthHeader } from '../components/user/UserService'

const schema = __GRAPHQL_SCHEMA__

const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: '/api/graphql'
})

export const middlewareLink = new ApolloLink((operation, forward) => {
  operation.setContext({ headers: getAuthHeader() })
  return forward(operation)
})

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: schema.data
})

const cache = new InMemoryCache({
  fragmentMatcher
})

export const apolloClient = new ApolloClient({
  link: middlewareLink.concat(httpLink),
  cache,
  connectToDevTools: true
})

export const apolloProvider = new VueApollo({defaultClient: apolloClient})
