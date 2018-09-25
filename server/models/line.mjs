import _ from 'lodash'
import { connection } from '../utils/db'
import i18n from 'i18next'
import mongodb from 'mongodb'

import { processMongoException, NotFoundError } from './exception'

/*
 * Model of a wallet line contains :
 *        _id: {type: ObjectId},
 *        user: {type: String},
 *        label: {type: String},
 *        type: {type: String},
 *        group: {type: String},
 *        encryption: {type: encrypted Object}
 *        updatedAt: {type: Date}
 *        _rev: {type: Number}
 *
 * And all other informations that a user want to store in the wallet line (depending on the wallet).
 */
export async function getLines (filter, sort) {
  const find = {}

  if (_.isString(filter.user)) {
    find.user = filter.user
  }

  return (await connection()).collection('walletlines').find(find).sort(sort).toArray()
}

export async function getLine (id, _rev) {
  const query = { _id: new mongodb.ObjectID(id) }
  if (_rev !== undefined) {
    query._rev = _rev
  }

  const line = (await connection()).collection('walletlines').findOne(query)
  processNotFound(id, line)
  return line
}

export async function saveLine (line) {
  const cleanLine = _.omit(line, '_rev')
  const revision = line._rev
  const query = { _id: new ObjectID(line._id) }
  if (revision) {
    query._rev = revision
  }

  try {
    const doc = await (await connection()).collection('walletlines').findOneAndUpdate(query, { $set: cleanLine, $inc: { _rev: 1 } }, { returnOriginal: false, upsert: true })
    return doc.value
  } catch (err) {
    processMongoException(err)
  }
}

export async function removeLine (id) {
  const line = await (await connection()).collection('walletlines').deleteOne({ _id: new ObjectID(id) })
  processNotFound(id, line)
  return line
}

function processNotFound (lineId, line) {
  if (!line) {
    throw new NotFoundError(i18n.t('error:line.404.lineNotFound', { lineId }))
  }
}
