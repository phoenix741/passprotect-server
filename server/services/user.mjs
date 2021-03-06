import debug from 'debug'
import i18n from 'i18next'
import _ from 'lodash'
import { AuthorizationError } from '../models/exception'
import { getUsers as getUsersModel, getUser as getUserModel, registerUser as registerUserModel } from '../models/user'
import { hashPassword, checkPassword } from './crypto'

const log = debug('App:Service:User')

export async function getUsers (params = {}) {
  log('Get all users with params ', params)

  const filter = _.pick(params, 'confirmationToken')

  return getUsersModel(filter)
}

export async function getUser (id) {
  log('Get the user with id', id)
  return getUserModel(id)
}

/**
 * Create an object that can be used in the JWT token.
 * @param {Object} user clear user
 * @returns {Promise} promise on the token.
 */
export async function createSessionUser (user) {
  log('Create the session payload for user ', user._id)
  const payload = _.pick(user, '_id')

  return payload
}

export async function getUserFromSession (payload) {
  log('Get the user for the payload ', payload._id)

  return getUser(payload._id)
}

export async function verifyPassword (user, password) {
  log('Verify the password of the user ', user._id)

  const isValid = await checkPassword(password, user.password)
  if (!isValid) {
    throw new AuthorizationError(i18n.t('error:user.404.userNotFound'))
  }
  return user
}

export async function registerUser (user) {
  log(`Create the user with the id ${user._id}`)

  user.creationAt = new Date()

  const hash = await hashPassword(user.password)
  user.password = hash

  return registerUserModel(user)
}
