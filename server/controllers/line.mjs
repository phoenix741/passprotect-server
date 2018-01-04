import {pick, isString, isEmpty} from 'lodash'
import i18n from 'i18next'
import fs from 'fs'
import path from 'path'
import debug from 'debug'
import {checkPermission} from '../utils/authentification'
import {getLines, getLine, removeLine, saveLine} from '../services/line'
import {getGroups} from '../services/group'

const log = debug('App:Controllers:Line')

log('Load line type definition')
export const typeDefs = [
  fs.readFileSync(path.join(__dirname, '..', '..', 'common', 'graphql', 'line.graphql'), 'utf-8')
]

export const resolvers = {
  RootQuery: {
    async lines (obj, args, {user}) {
      checkPermission(user)
      const lines = await getLines(user)
      lines.forEach(line => checkPermission(user, line.user))
      return lines.map(filterLine)
    },

    async line (obj, {id}, {user}) {
      checkPermission(user)
      const line = await getLine(id)
      checkPermission(user, line.user)
      return filterLine(line)
    },

    async groups (obj, args, {user}) {
      checkPermission(user)
      return getGroups(user)
    }
  },
  User: {
    async lines (obj, args, {user}) {
      checkPermission(user)
      const line = await getLines(obj._id)
      checkPermission(user, line.user)

      return line.map(filterLine)
    }
  },

  RootMutation: {
    async createUpdateLine (obj, {input}, {user}) {
      log(`createUpdateLine with id ${input._id}`)
      checkPermission(user)
      try {
        if (input._id) {
          const line = await getLine(input._id)
          checkPermission(user, line.user)
          input._id = line._id
        }

        input.user = user._id

        const data = await sanitizeInput(input)
        const line = await saveLine(data)
        log(`Line will be saved with the id ${line._id}`)
        return filterLine(line)
      } catch (err) {
        return parseErrors(err)
      }
    },

    async removeLine (obj, {id}, {user}) {
      checkPermission(user)
      try {
        const line = await getLine(id)
        checkPermission(user, line.user)
        await removeLine(id)
        return {errors: []}
      } catch (err) {
        return parseErrors(err)
      }
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
  if (!typeChoices.includes(data.type)) {
    validationError.message = i18n.t('error:line.400.type', {choices: typeChoices.join(', ')})
    throw validationError
  }

  if (!isString(data.label) || isEmpty(data.label)) {
    validationError.message = i18n.t('error:line.400.label')
    throw validationError
  }

  return data
}

function parseErrors (err) {
  return {
    errors: [{
      fieldName: err.field || 'label',
      message: err.message
    }]
  }
}
