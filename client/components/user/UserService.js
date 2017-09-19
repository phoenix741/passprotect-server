/* global __PASSPROTECT_CONFIG__, localStorage */

'use strict'

import createSession from './createSession.gql'
import registerUser from './registerUser.gql'
import {generateIV, generateKey, encrypt, decrypt, createKeyDerivation} from '../../utils/crypto'
import {parseErrors} from '../../utils/errors'

const config = __PASSPROTECT_CONFIG__.crypto

export let SESSION = {
  authenticated: false
}

export async function login (context, creds, redirect) {
  try {
    const response = await context.$apollo.mutate({
      mutation: createSession,
      variables: { input: creds }
    })

    parseErrors(response.data.createSession)

    const clearKey = await createClearKey(response.data.createSession.user, creds.password)

    SESSION.jwtToken = response.data.createSession.token
    SESSION.username = creds.username
    SESSION.clearKey = clearKey
    SESSION.authenticated = true

    localStorage.setItem('jwtToken', SESSION.jwtToken)
    localStorage.setItem('username', SESSION.username)
    localStorage.setItem('clearKey', SESSION.clearKey)

    if (redirect) {
      context.$router.go(redirect)
    } else {
      context.$router.push('/items')
    }
  } catch (err) {
    context.error = err
  }
}

export async function signup (context, creds, redirect) {
  // Idem login avec mutation signup + récup token
  try {
    const encryption = await generateMasterKey(creds.username, creds.password)
    const result = await context.$apollo.mutate({
      mutation: registerUser,
      variables: { input: { _id: creds.username, password: creds.password, encryption } }
    })

    parseErrors(result.data.registerUser)

    return await login(context, creds, redirect)
  } catch (err) {
    context.error = err
  }
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
  if (localStorage.getItem('jwtToken')) {
    return {
      Authorization: localStorage.getItem('jwtToken')
    }
  }
  return {}
}

async function generateMasterKey (user, password) {
  const salt = await generateIV(config.ivSize)
  const masterKey = await generateKey(config.keySize)
  const masterKeyKey = await createKeyDerivation(password, salt, config.pbkdf2)

  const encryptedKey = await encrypt(masterKey, masterKeyKey.key, masterKeyKey.iv, config.cypherIv)

  return {salt, encryptedKey}
}

async function createClearKey (user, password) {
  const salt = user.encryption.salt
  const masterKeyKey = await createKeyDerivation(password, salt, config.pbkdf2)

  const key = masterKeyKey.key
  const iv = masterKeyKey.iv
  const encryptedKey = user.encryption.encryptedKey

  const clearKey = await decrypt(encryptedKey, key, iv, config.cypherIv)

  return clearKey.toString('binary')
}
