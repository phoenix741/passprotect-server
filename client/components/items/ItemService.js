/* global __PASSPROTECT_CONFIG__ */

'use strict'

import promisify from 'es6-promisify'
import {SESSION} from '../user/UserService'
import {createKeyDerivation, decrypt, encrypt, generateIV, generatePassword} from '../../utils/crypto'
import {parseErrors} from '../../utils/errors'
import {merge, find, remove, pick, clone} from 'lodash'
import createUpdateLine from './createUpdateLine.gql'
import removeLineQuery from './removeLine.gql'
import getLines from './getLines.gql'
import getGroups from './getGroups.gql'
import getLinesWithDetail from './getLinesWithDetail.gql'
import downloadAsFile from 'download-as-file'
import json2csv from 'json2csv'

const config = __PASSPROTECT_CONFIG__.crypto

const json2csvAsync = promisify(json2csv)

export const cardTypeMapping = {
  card: {
    label: 'items:list.type.card',
    icon: 'credit_card',
    color: 'red',
    fields: {
      group: '',
      type: '',
      nameOnCard: '',
      cardNumber: '',
      cvv: '',
      expiry: '',
      code: '',
      notes: ''
    }
  },
  password: {
    label: 'items:list.type.password',
    icon: 'fingerprint',
    color: 'blue',
    fields: {
      group: '',
      username: '',
      password: '',
      siteUrl: '',
      notes: ''
    }
  },
  text: {
    label: 'items:list.type.text',
    icon: 'text_fields',
    color: 'green',
    fields: {
      group: '',
      text: '',
      notes: ''
    }
  }
}

export async function updateLine (context, line) {
  try {
    const result = await context.$apollo.mutate({
      mutation: createUpdateLine,
      variables: { input: line },
      update (store, { data: { createUpdateLine } }) {
        const data = store.readQuery({ query: getLines })
        if (!find(data.lines, line => line._id === createUpdateLine._id)) {
          data.lines.push(createUpdateLine)
          store.writeQuery({ query: getLines, data })
        }

        const dataGroup = store.readQuery({ query: getGroups })
        if (!find(dataGroup.groups, group => group === createUpdateLine.group)) {
          dataGroup.groups.push(createUpdateLine.group)
          store.writeQuery({ query: getGroups, dataGroup })
        }
      },
      optimisticResponse: {
        __typename: 'Mutation',
        createUpdateLine: merge({
          __typename: 'WalletLine',
          updatedAt: (new Date()).getTime(),
          encryption: {
            __typename: 'EncryptedWalletLine',
            informations: {
              __typename: 'EncryptedContent'
            }
          }
        }, line)
      }
    })

    parseErrors(result.data.createUpdateLine)
  } catch (err) {
    context.error = err
  }
}

export async function removeLine (context, lineId) {
  try {
    const result = await context.$apollo.mutate({
      mutation: removeLineQuery,
      variables: { id: lineId },
      update (store, { data: { removeLine } }) {
        const data = store.readQuery({ query: getLines })
        if (!removeLine.errors || !removeLine.errors.length) {
          remove(data.lines, line => line._id === lineId)
          store.writeQuery({ query: getLines, data })
        }
      },
      optimisticResponse: {
        __typename: 'Mutation',
        removeLine: {
          __typename: 'Errors',
          errors: []
        }
      }
    })

    parseErrors(result.data.removeLineQuery)
  } catch (err) {
    context.error = err
  }
}

export async function encryptLine (clearInformation) {
  const informationsString = JSON.stringify(clearInformation)

  const salt = await generateIV(config.ivSize)
  const lineKey = await createKeyDerivation(SESSION.clearKey, salt, config.pbkdf2)

  const informations = await encrypt(Buffer.from(informationsString, 'utf-8'), lineKey.key, lineKey.iv, config.cypherIv)

  return {salt, informations}
}

export async function decryptLine (line) {
  if (!line.encryption || !line.encryption.informations) {
    return completeFields(line.type, {})
  }

  const salt = line.encryption.salt
  const informationsEncrypted = line.encryption.informations

  const lineKey = await createKeyDerivation(SESSION.clearKey, salt, config.pbkdf2)
  const informationString = await decrypt(informationsEncrypted, lineKey.key, lineKey.iv, config.cypherIv)

  return completeFields(line.type, JSON.parse(informationString))
}

export async function generate () {
  return generatePassword(128)
}

export async function exportLinesAsCsv (context) {
  const data = await exportLines(context)
  const csv = await json2csvAsync({data})

  return downloadAsFile({data: csv, filename: 'password.csv'})
}

export async function exportLines (context) {
  const query = await new Promise(function (resolve, reject) {
    context.$apollo.addSmartQuery('lines', {
      query: getLinesWithDetail,
      result ({data}) {
        setTimeout(() => context.$apollo.queries.lines.stop())
        resolve(data.lines)
      },
      error (error) {
        reject(error)
      }
    })
  })

  return Promise.all(query.map(async line => {
    const copy = clone(line)
    copy.decryptedContent = await decryptLine(copy)

    return merge(
      pick(copy, ['label']),
      pick(copy.decryptedContent, ['username', 'password', 'siteUrl', 'notes']),
      pick(copy.decryptedContent, ['type', 'nameOnCard', 'cardNumber', 'cvv', 'expiry', 'code', 'notes']),
      pick(copy.decryptedContent, ['text', 'notes'])
    )
  }))
}

function completeFields (type, clearInformation) {
  const fields = cardTypeMapping[type].fields
  return merge({}, fields, clearInformation)
}
