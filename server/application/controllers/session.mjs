import config from 'config'
import {pick, omit, isString, isEmpty} from 'lodash'
import i18n from 'i18next'
import {getUser, createSessionUser, verifyPassword} from '../services/user'
import jsonwebtoken from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import debug from 'debug'
import {promisify} from 'util'

const log = debug('App:Controllers:Session')

const jwtSignAsync = promisify(jsonwebtoken.sign)

log('Load session type definition')
export const typeDefs = [
  fs.readFileSync(path.join(__dirname, '..', '..', '..', 'common', 'graphql', 'session.graphql'), 'utf-8')
]

export const resolvers = {
  RootQuery: {
    session (obj, args, {user}) {
      return filterUser(user)
    }
  },

  RootMutation: {
    async createSession (obj, {input}, {res}) {
      try {
        const data = sanitizeInput(input)
        const {user, jwtToken} = await connectSession(data)

        res.cookie('jwt', jwtToken, {httpOnly: true})
        return {token: 'bearer ' + jwtToken, user: filterUser(user)}
      } catch (err) {
        return parseErrors(err)
      }
    },

    clearSession (obj, args, {res}) {
      res.clearCookie('jwt')
    }
  },

  CreateSessionResult: {
    __resolveType (obj) {
      if (obj.errors) {
        return 'Errors'
      }

      return 'ConnectionInformation'
    }
  }
}

function sanitizeInput (input) {
  const data = pick(input, 'username', 'password')

  const validationError = new Error()
  validationError.status = 401
  if (!isString(data.username) || isEmpty(data.username)) {
    validationError.message = i18n.t('error:user.401.username')
    throw validationError
  }

  if (!isString(data.password) || isEmpty(data.password)) {
    validationError.message = i18n.t('error:user.401.password')
    throw validationError
  }

  return data
}

async function connectSession ({username, password}) {
  const user = await getUser(username)
  await verifyPassword(user, password)
  const payload = await createSessionUser(user)
  const jwtToken = await jwtSignAsync({user: payload}, config.get('config.jwt.secret'), {})

  return [user, jwtToken]
}

function filterUser (user) {
  return user ? omit(user, 'password', 'confirmationToken') : null
}

function parseErrors (err) {
  return {
    errors: [{
      fieldName: err.field || 'global',
      message: err.message
    }]
  }
}
