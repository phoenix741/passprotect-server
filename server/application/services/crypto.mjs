import bcrypt from 'bcrypt'

export async function hashPassword (password) {
  const salt = await bcrypt.genSalt()
  return bcrypt.hash(password, salt)
}

export async function checkPassword (password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword)
}
