import bcrypt from 'bcrypt-nodejs'

export function hashPassword (password) {
  const genSaltPromise = Promise.fromCallback(cb => bcrypt.genSalt(0, cb))
  return genSaltPromise.then(salt => Promise.fromCallback(cb => bcrypt.hash(password, salt, null, cb)))
}

export function checkPassword (password, hashedPassword) {
  return Promise.fromCallback(cb => bcrypt.compare(password, hashedPassword, cb))
}
