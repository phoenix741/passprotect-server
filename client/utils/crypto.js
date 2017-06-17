'use strict'

import crypto from 'crypto'
import streamToPromise from 'stream-to-promise'

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'

export function createKeyDerivation (password, salt, options) {
  const iterations = options.iterations
  const keylen = options.keylen / 8
  const ivlen = options.ivlen / 8
  const digest = options.digest

  return Promise
    .fromCallback(cb => crypto.pbkdf2(password, salt, iterations, keylen + ivlen, digest, cb))
    .then(array => splitBuffer(array, keylen, ivlen))
}

export function generateIV (size) {
  return Promise
    .fromCallback(cb => crypto.randomBytes(size / 8, cb))
    .then(iv => new Buffer(iv).toString('hex'))
}

export function generateKey (size) {
  return Promise
    .fromCallback(cb => crypto.randomBytes(size / 8, cb))
    .then(iv => new Buffer(iv).toString('hex'))
}

export function generatePassword (size) {
  const len = size / 8
  return Promise
    .fromCallback(cb => crypto.randomBytes(len, cb))
      .then(generatedChars => {
        const password = new Array(len)
        for (let i = 0; i < len; i++) {
          password[i] = chars[generatedChars[i] % chars.length]
        }

        return password.join('')
      })
}

export function encrypt (text, key, iv, options) {
  const encryptor = crypto.createCipheriv(options.algorithm, new Buffer(key, 'hex'), new Buffer(iv, 'hex'))
  encryptor.write(text)
  encryptor.end()

  const promise = streamToPromise(encryptor)
  return promise
    .then(content => {
      return {
        content: new Buffer(content).toString('hex'),
        authTag: encryptor.getAuthTag().toString('hex')
      }
    })
}

export function decrypt (text, key, iv, options) {
  const decryptor = crypto.createDecipheriv(options.algorithm, new Buffer(key, 'hex'), new Buffer(iv, 'hex'))
  decryptor.setAuthTag(new Buffer(text.authTag, 'hex'))
  decryptor.write(text.content, 'hex')
  decryptor.end()

  return streamToPromise(decryptor)
}

function splitBuffer (array, keylen, ivlen) {
  return {
    key: Buffer.from(array.buffer, 0, keylen).toString('hex'),
    iv: Buffer.from(array.buffer, keylen, ivlen).toString('hex')
  }
}
