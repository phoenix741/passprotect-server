import {isString} from 'lodash'
import {promise as dbPromise} from '../utils/db'
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
export function getUsers (filter = {}) {
  const find = {}

  if (isString(filter.confirmationToken)) {
    find.confirmationToken = filter.confirmationToken
  }

  return dbPromise
    .then(db => db.collection('users').find(find).toArray())
}

export function getUser (id) {
  return dbPromise
    .then(db => db.collection('users').findOne({ _id: id.toLowerCase() }))
    .then(user => processNotFound(id, user))
}

export function registerUser (user) {
  normalizeUser(user)

  return dbPromise
    .then(db => db.collection('users').insert(user))
    .then(() => user)
    .catch(processMongoException)
}

export function saveUser (user) {
  normalizeUser(user)

  return dbPromise
    .then(db => db.collection('users').save(user))
    .then(() => user)
    .catch(processMongoException)
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
  return user
}
