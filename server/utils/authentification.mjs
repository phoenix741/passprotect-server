import config from 'config'
import debug from 'debug'
import { getUserFromSession } from '../services/user'
import jsonwebtoken from 'jsonwebtoken'
import { promisify } from 'util'

const log = debug('App:Passport')
const jwtVerifyAsync = promisify(jsonwebtoken.verify)

export async function websocketVerifyClient (info, cb) {
  const authorization = (info.req.headers.authorization || 'bearer ').substr(7)
  log('Websocket connection via ' + (authorization ? 'authorization header' : ''))

  try {
    const payload = await jwtVerifyAsync(authorization, config.get('config.jwt.secret'))
    const user = await getUserFromSession(payload.user)

    log(`User ${user._id} connected on the websocket`)
    info.req.user = user
    cb(true) // eslint-disable-line standard/no-callback-literal
  } catch (err) {
    log('Can\'t connect token ' + authorization + ' because of ' + err.message)
    cb(false, err.status) // eslint-disable-line standard/no-callback-literal
  }
}

export async function processPayload (req, res, next) {
  log('Process the payload', req.payload)
  try {
    if (req.payload) {
      const user = await getUserFromSession(req.payload.user)
      log(`The payload will result to the user `, user)
      req.user = user
    }
    next()
  } catch (err) {
    next(err)
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
