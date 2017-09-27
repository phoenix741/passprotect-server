import mongodb from 'mongodb'
import config from 'config'
import debug from 'debug'

const log = debug('App:Utils:Db')

let promise = null

export function connection () {
  if (!promise) {
    promise = mongodb.MongoClient
      .connect(config.get('config.mongodb.host'), config.get('config.mongodb.options'))
      .then(database => {
        log('Express server connected to mongodb host ' + config.get('config.mongodb.host'))
        return database
      })
      .catch(err => {
        promise = null
        throw err
      })
  }

  return promise
}
