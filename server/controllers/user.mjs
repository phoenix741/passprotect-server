import { pick, omit, isString, isEmpty, isObject } from 'lodash'
import i18n from 'i18next'
import debug from 'debug'
import fs from 'fs'
import path from 'path'
import { checkPermission } from '../utils/authentification'
import { getUser, registerUser } from '../services/user'

const log = debug('App:Controllers:User')

log('Load user type definition')
export const typeDefs = [
  fs.readFileSync(path.join(__dirname, '..', '..', 'common', 'graphql', 'user.graphql'), 'utf-8')
]

export const resolvers = {
  RootQuery: {
    async user (obj, { id }, { user }) {
      checkPermission(user, id)
      const dbUser = await getUser(id)
      return filterUser(dbUser)
    }
  },
  WalletLine: {
    async user (obj, args, { user }) {
      checkPermission(user, obj.user)
      const dbUser = await getUser(obj.user)
      return filterUser(dbUser)
    }
  },
  WalletTransaction: {
    async user (obj, { id }, { user }) {
      checkPermission(user, id)
      const dbUser = getUser(obj.user)
      return filterUser(dbUser)
    }
  },

  RootMutation: {
    async registerUser (obj, { input }) {
      try {
        const data = sanitizeUser(input)
        const user = await registerUser(data)
        return filterUser(user)
      } catch (err) {
        return parseErrors(err)
      }
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
    throw validationError
  }

  if (!isString(data.password) || isEmpty(data.password) || data.password.length < 8) {
    validationError.message = i18n.t('error:user.400.password')
    throw validationError
  }

  if (!isObject(data.encryption)) {
    validationError.message = i18n.t('error:user.400.encryption')
    throw validationError
  }

  data.encryption = pick(data.encryption, 'salt', 'encryptedKey')

  if (!isObject(data.encryption.encryptedKey) || !isString(data.encryption.salt)) {
    validationError.message = i18n.t('error:user.400.encryption')
    throw validationError
  }

  data.encryption.encryptedKey = pick(data.encryption.encryptedKey, 'content', 'authTag')

  if (!isString(data.encryption.encryptedKey.content) || !isString(data.encryption.encryptedKey.authTag)) {
    validationError.message = i18n.t('error:user.400.encryption')
    throw validationError
  }

  return data
}

function filterUser (user) {
  return omit(user, 'password', 'confirmationToken')
}

function parseErrors (err) {
  return {
    errors: [{
      fieldName: err.field || 'username',
      message: err.message
    }]
  }
}
