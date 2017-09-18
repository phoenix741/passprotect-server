import {pick, includes, isString, isEmpty} from 'lodash'
import i18n from 'i18next'
import fs from 'fs'
import path from 'path'
import debug from 'debug'
import {checkPermission} from '../utils/passport'
import {getLines, getLine, removeLine, saveLine} from '../services/line'
import {getGroups} from '../services/group'

const log = debug('App:Controllers:Line')

log('Load line type definition')
export const typeDefs = [
  fs.readFileSync(path.join(__dirname, '..', '..', '..', 'common', 'graphql', 'line.graphql'), 'utf-8')
]

export const resolvers = {
  RootQuery: {
    lines (obj, args, {user}) {
      return checkPermission(user).then(() => getLines(user)).map(line => checkPermission(user, [], line.user).return(line)).map(filterLine)
    },

    line (obj, {id}, {user}) {
      return getLine(id).tap(line => checkPermission(user, [], line.user)).then(filterLine)
    },

    groups (obj, args, {user}) {
      return checkPermission(user).then(() => getGroups(user))
    }
  },
  User: {
    lines (obj, args, {user}) {
      return getLines(obj._id).map(line => checkPermission(user, [], line.user).return(line)).map(filterLine)
    }
  },

  RootMutation: {
    createUpdateLine (obj, {input}, {user}) {
      let checkPermissionPromise = Promise.resolve(input)
      if (input._id) {
        checkPermissionPromise = getLine(input._id)
          .tap(line => checkPermission(user, [], line.user))
          .then(line => {
            input._id = line._id
            return input
          })
      }

      input.user = user._id
      return checkPermissionPromise
        .then(input => sanitizeInput(input))
        .then(data => saveLine(data))
        .then(filterLine)
        .catch(parseErrors)
    },

    removeLine (obj, {id}, {user}) {
      return getLine(id)
        .tap(line => checkPermission(user, [], line.user))
        .then(() => removeLine(id))
        .then(() => ({errors: []}))
        .catch(parseErrors)
    }
  },

  CreateUpdateLineResult: {
    __resolveType (obj) {
      if (obj.errors) {
        return 'Errors'
      }
      return 'WalletLine'
    }
  }
}

/**
 * Filter information that the user is authorized to view in the response
 * @param {Object} line The response
 * @returns {Object} The filtered object.
 */
function filterLine (line) {
  return pick(line, '_id', 'user', 'type', 'label', 'group', 'encryption', 'updatedAt', '_rev')
}

function sanitizeInput (input) {
  const data = pick(input, '_id', 'user', 'type', 'label', 'group', 'encryption', '_rev')

  const validationError = new Error()
  validationError.status = 400

  const typeChoices = ['card', 'password', 'text']
  if (!includes(typeChoices, data.type)) {
    validationError.message = i18n.t('error:line.400.type', {choices: typeChoices.join(', ')})
    return Promise.reject(validationError)
  }

  if (!isString(data.label) || isEmpty(data.label)) {
    validationError.message = i18n.t('error:line.400.label')
    return Promise.reject(validationError)
  }

  return Promise.resolve(data)
}

function parseErrors (err) {
  return {
    errors: [{
      fieldName: err.field || 'global',
      message: err.message
    }]
  }
}
