/* global __PASSPROTECT_CONFIG__ */

'use strict'

import {pick} from 'lodash'
import createSession from './createSession.gql'
import registerUser from './registerUser.gql'
import {generateIV, generateKey, encrypt, decrypt, createKeyDerivation} from '../../utils/crypto'
import {parseErrors} from '../../utils/errors'

const config = __PASSPROTECT_CONFIG__.crypto

export let SESSION = {
  authenticated: false
}

export function login (context, creds, redirect) {
  return context.$apollo
    .mutate({
      mutation: createSession,
      variables: {
        input: creds
      }
    })
    .tap(result => parseErrors(result.data.createSession))
    .then(response => {
      SESSION.jwtToken = response.data.createSession.token

      return createClearKey(response.data.createSession.user, creds.password)
    })
    .then(clearKey => {
      SESSION.username = creds.username
      SESSION.clearKey = clearKey
      SESSION.authenticated = true

      localStorage.setItem('username', SESSION.username)
      localStorage.setItem('jwtToken', SESSION.jwtToken)
      localStorage.setItem('clearKey', SESSION.clearKey)

      if (redirect) {
        context.$router.go(redirect)
      } else {
        context.$router.push('/items')
      }
    })
    .catch(err => (context.error = err))
}

export function signup (context, creds, redirect) {
  // Idem login avec mutation signup + récup token
  return generateMasterKey(creds.username, creds.password)
  .then(function (encryption) {
    return context.$apollo.mutate({
      mutation: registerUser,
      variables: {
        input: {
          _id: creds.username,
          password: creds.password,
          encryption
        }
      }
    })
  })
  .tap(result => parseErrors(result.data.registerUser))
  .then(() => login(context, creds, redirect))
  .catch(err => (context.error = err))
}

export function logout (context) {
  SESSION.authenticated = false
  delete SESSION.username
  delete SESSION.jwtToken
  delete SESSION.clearKey

  localStorage.removeItem('username')
  localStorage.removeItem('jwtToken')
  localStorage.removeItem('clearKey')

  context.$apollo.provider.defaultClient.resetStore()
  context.$router.push('/items')
}

export function checkAuth () {
  SESSION.authenticated = !!localStorage.getItem('jwtToken')
  SESSION.username = localStorage.getItem('username')
  SESSION.jwtToken = localStorage.getItem('jwtToken')
  SESSION.clearKey = localStorage.getItem('clearKey')
}

export function getAuthHeader () {
  return {
    Authorization: localStorage.getItem('jwtToken')
  }
}

function generateMasterKey (user, password) {
  const salt = generateIV(config.ivSize)
  const masterKey = generateKey(config.keySize)
  const masterKeyKey = salt.then(salt => createKeyDerivation(password, salt, config.pbkdf2))

  const encryptedKey = Promise
    .props({masterKey, masterKeyKey})
    .then(obj => encrypt(obj.masterKey, obj.masterKeyKey.key, obj.masterKeyKey.iv, config.cypherIv))

  return Promise
    .props({salt, encryptedKey})
    .then(obj => pick(obj, ['salt', 'encryptedKey']))
}

function createClearKey (user, password) {
  const salt = user.encryption.salt
  const masterKeyKeyPromise = createKeyDerivation(password, salt, config.pbkdf2)

  return masterKeyKeyPromise
    .then(masterKeyKey => {
      const key = masterKeyKey.key
      const iv = masterKeyKey.iv
      const encryptedKey = user.encryption.encryptedKey

      return decrypt(encryptedKey, key, iv, config.cypherIv)
    })
    .then(key => key.toString('binary'))
}
