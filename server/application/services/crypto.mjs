import bcrypt from 'bcrypt'

export function hashPassword (password) {
  return bcrypt.genSalt().then(salt => bcrypt.hash(password, salt))
}

export function checkPassword (password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword)
}
