import logger from 'morgan-debug'

import i18n from 'i18next'
import i18nMiddleware from 'i18next-express-middleware'

import { bootstrap } from './utils/i18n'
import { connection } from './utils/db'

export default app => {
  app.use(logger('App:Express', 'dev'))
  app.use(i18nMiddleware.handle(i18n, {
    removeLngFromUrl: false
  }))

  this.app.use((req, res, next) => {
    connection()
    next()
  })

  bootstrap(app.get('env'))
}
