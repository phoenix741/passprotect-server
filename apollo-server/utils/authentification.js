import config from 'config'
import debug from 'debug'
import { getUserFromSession } from '../services/user'
import jsonwebtoken from 'jsonwebtoken'
import { promisify } from 'util'

const log = debug('App:Passport')
const jwtVerifyAsync = promisify(jsonwebtoken.verify)

export async function validateToken (req, connection) {
  // If the websocket context was already resolved
  if (connection && connection.context) return connection.context

  let token
  // HTTP
  if (req) token = req.get('Authorization')
  // Websocket
  if (connection) token = connection.authorization

  // User validation
  log('Connection via ' + (req ? 'authorization header' : 'connection header'))

  try {
    const payload = await jwtVerifyAsync(token, config.get('config.jwt.secret'))
    const user = await getUserFromSession(payload.user)

    log(`User ${user._id} connected on the websocket`)

    return {
      token,
      user
    }
  } catch (err) {
    log('Can\'t connect token ' + token + ' because of ' + err.message)
    return {
      token,
      user: null
    }
  }
}

/**
 * Check permission of the user based on the role given
 * @param {Object} user User used to check permission
 * @param {String} userId User ID to compare to the user
 */
export function checkPermission (user, userId) {
  log(`Check that the user ${(user || {})._id} have acces to a resource that the owner is ${userId}`)
  if (user) {
    if (userId && userId !== user._id) {
      throw new Error('The user isn\'t authorized to view this resource')
    }
  } else {
    throw new Error('The user should be authentified to view this resource')
  }
}
