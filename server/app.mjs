import express from 'express'
import logger from 'morgan-debug'

import i18n from 'i18next'
import i18nMiddleware from 'i18next-express-middleware'

import { Core } from './core'
import { bootstrap } from './utils/i18n'

const app = express()

app.set('port', process.env.PORT || 3000)

app.use(logger('App:Express', 'dev'))
app.use(i18nMiddleware.handle(i18n, {
  removeLngFromUrl: false
}))

bootstrap(app.get('env'))

const core = new Core(app)
core.run()
