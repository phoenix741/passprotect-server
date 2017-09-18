import {pick, omit, isString, isEmpty, isObject} from 'lodash'
import i18n from 'i18next'
import debug from 'debug'
import fs from 'fs'
import path from 'path'
import {checkPermission} from '../utils/passport'
import {getUsers, getUser, registerUser} from '../services/user'

const log = debug('App:Controllers:User')

log('Load user type definition')
export const typeDefs = [
  fs.readFileSync(path.join(__dirname, '..', '..', '..', 'common', 'graphql', 'user.graphql'), 'utf-8')
]

export const resolvers = {
  RootQuery: {
    users (obj, args, {user}) {
      return checkPermission(user, ['admin']).then(getUsers).then(users => users.map(filterUser))
    },

    user (obj, {id}, {user}) {
      return checkPermission(user, ['admin'], id).then(() => getUser(id)).then(filterUser)
    }
  },
  WalletLine: {
    user (obj, args, {user}) {
      return checkPermission(user, ['admin'], obj.user).then(() => getUser(obj.user)).then(filterUser)
    }
  },
  WalletTransaction: {
    user (obj, {id}, {user}) {
      return checkPermission(user, ['admin'], id).then(() => getUser(obj.user)).then(filterUser)
    }
  },

  RootMutation: {
    registerUser (obj, {input}) {
      return sanitizeUser(input)
        .then(data => registerUser(data))
        .then(filterUser)
        .catch(parseErrors)
    }
  },

  RegisterUserResult: {
    __resolveType (obj) {
      if (obj.errors) {
        return 'Errors'
      }

      return 'User'
    }
  }
}

function sanitizeUser (input) {
  const data = pick(input, '_id', 'password', 'encryption')

  const validationError = new Error()
  validationError.status = 400
  if (!isString(data._id) || isEmpty(data._id)) {
    validationError.message = i18n.t('error:user.400._id')
    return Promise.reject(validationError)
  }

  if (!isString(data.password) || isEmpty(data.password) || data.password.length < 8) {
    validationError.message = i18n.t('error:user.400.password')
    return Promise.reject(validationError)
  }

  if (!isObject(data.encryption)) {
    validationError.message = i18n.t('error:user.400.encryption')
    return Promise.reject(validationError)
  }

  data.encryption = pick(data.encryption, 'salt', 'encryptedKey')

  if (!isObject(data.encryption.encryptedKey) || !isString(data.encryption.salt)) {
    validationError.message = i18n.t('error:user.400.encryption')
    return Promise.reject(validationError)
  }

  data.encryption.encryptedKey = pick(data.encryption.encryptedKey, 'content', 'authTag')

  if (!isString(data.encryption.encryptedKey.content) || !isString(data.encryption.encryptedKey.authTag)) {
    validationError.message = i18n.t('error:user.400.encryption')
    return Promise.reject(validationError)
  }

  return Promise.resolve(data)
}

function filterUser (user) {
  return omit(user, 'password', 'confirmationToken')
}

function parseErrors (err) {
  return {
    errors: [{
      fieldName: err.field || 'global',
      message: err.message
    }]
  }
}
