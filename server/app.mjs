import express from 'express'
import logger from 'morgan-debug'
import errorHandler from 'errorhandler'

import i18n from 'i18next'
import i18nMiddleware from 'i18next-express-middleware'

import { Core } from './core'
import { connection as dbConnection } from './utils/db'
import { bootstrap } from './utils/i18n'

const app = express()

app.set('port', process.env.PORT || 3000)

app.use((req, res, next) => {
  dbConnection()
  next()
})

app.use(logger('App:Express', 'dev'))
if (app.get('env') === 'development') {
  app.use(errorHandler())
}

app.use(i18nMiddleware.handle(i18n, {
  removeLngFromUrl: false
}))

bootstrap(app.get('env'))

const core = new Core(app)
core.run()
