import debug from 'debug'
import { NotFoundError } from '../models/exception'
import { getLines as getLinesModel, getLine as getLineModel, saveLine as saveLineModel, removeLine as removeLineModel } from '../models/line'
import { createTransaction } from '../services/transaction'

const log = debug('App:Service:Line')

export async function getLines (user) {
  log('Get all lines from user ', user._id)

  const filter = {}
  filter.user = user._id

  const sort = {}
  sort.group = 1
  sort.label = 1

  return getLinesModel(filter, sort)
}

export async function getLine (id) {
  log(`Get the line with id ${id}`)
  return getLineModel(id)
}

export async function saveLine (line) {
  log(`Create the line of type ${line.type}`)

  line.updatedAt = new Date()

  const oldLine = await getLineIfAvailable(line._id, line._rev)
  const newLine = await saveLineModel(line)
  await createTransaction('line', oldLine, newLine)
  return newLine
}

export async function removeLine (id) {
  log(`Remove the line with the id ${id}`)

  const oldLine = await getLineIfAvailable(id)
  await removeLineModel(id)
  return createTransaction('line', oldLine)
}

async function getLineIfAvailable (id, rev) {
  try {
    return await getLineModel(id, rev)
  } catch (err) {
    if (err instanceof NotFoundError) {
      return null
    }
    throw err
  }
}
