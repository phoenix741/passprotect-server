import { merge } from 'lodash'
import { validateToken } from './utils/authentification'

// Context passed to all resolvers (third argument)
// req => Query
// connection => Subscription
// eslint-disable-next-line no-unused-vars
export default async ({ req, connection }) => {
  return merge({}, validateToken(req, connection))
}
