import {MongoClient} from 'mongodb'
import config from 'config'
import debug from 'debug'

const log = debug('App:Utils:Db')

export let promise = null
export let db = null

export function connection () {
  if (!promise) {
    promise = Promise
      .fromCallback(cb => MongoClient.connect(config.get('config.mongodb.host'), config.get('config.mongodb.options'), cb))
      .then((database) => {
        log('Express server connected to mongodb host ' + config.get('config.mongodb.host'))
        db = database
        return database
      }).catch(err => {
        promise = null
        throw err
      })
  }

  return promise
}

connection().catch(err => log('Can\'t connect to mongodb', err))
