import {isString} from 'lodash'
import {promise as db} from '../utils/db'
import i18n from 'i18next'

import { processMongoException, NotFoundError } from './exception'

/*
 * Model of a user contains :
 *        _id: {type: String, required: true, unique: true, lowercase: true},
 *        password: {type: String, required: true, minlength: 8},
 *        lastLogin: {type: Date},
 *        confirmationToken: {type: String, sparse: true, unique: true},
 *        passwordRequestedAt: {type: Date}
 *        encryptionKey: {type: String},
 *        encryptionIV: {type: String}
 *
 * The encryptionKey is crypted with the password of the user and a salt.
 */
export async function getUsers (filter = {}) {
  const find = {}

  if (isString(filter.confirmationToken)) {
    find.confirmationToken = filter.confirmationToken
  }

  return (await db).collection('users').find(find).toArray()
}

export async function getUser (id) {
  const user = await (await db).collection('users').findOne({ _id: id.toLowerCase() })
  processNotFound(id, user)
  return user
}

export async function registerUser (user) {
  normalizeUser(user)

  try {
    await (await db).collection('users').insert(user)
    return user
  } catch (err) {
    processMongoException(err)
  }
}

export async function saveUser (user) {
  normalizeUser(user)

  try {
    await (await db).collection('users').save(user)
    return user
  } catch (err) {
    processMongoException(err)
  }
}

function normalizeUser (user) {
  // The _id of the user should always in lowercase to identify quickly the user
  user._id = user._id.toLowerCase()
  if (!user.role) {
    user.role = 'user'
  }
}

function processNotFound (userId, user) {
  if (!user) {
    throw new NotFoundError(i18n.t('error:user.404.userNotFound', { userId: userId }))
  }
}
