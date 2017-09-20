import {MongoClient, Logger} from 'mongodb'
import config from 'config'
import debug from 'debug'

const log = debug('App:Utils:Db')

export let promise = null
export let db = null

export function connection () {
  if (!promise) {
    promise = MongoClient
      .connect(config.get('config.mongodb.host'), config.get('config.mongodb.options'))
      .then(database => {
        log('Express server connected to mongodb host ' + config.get('config.mongodb.host'))
        Logger.setLevel('debug')
        db = database
        return database
      })
      .catch(err => {
        promise = null
        throw err
      })
  }

  return promise
}

connection().catch(err => log('Can\'t connect to mongodb', err))
