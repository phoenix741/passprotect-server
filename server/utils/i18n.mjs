import path from 'path'
import debug from 'debug'
import i18nBackend from 'i18next-node-fs-backend'
import i18n from 'i18next'

const log = debug('app:bootstrap')
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export function bootstrap () {
  log('Bootstrap i18n')
  // Init i18n
  const i18nOption = {
    ns: ['translation', 'error', 'items', 'user'],
    lng: 'fr',
    fallbackLng: 'fr',
    backend: {
      loadPath: path.join(__dirname, '..', '..', 'config', 'locales', '{{lng}}', '{{ns}}.json'),
      addPath: path.join(__dirname, '..', '..', 'config', 'locales', '{{lng}}', '{{ns}}.missing.json')
    }
  }

  log('Define the i18n options with ' + i18nOption)

  i18n
    .use(i18nBackend)
    .init(i18nOption)
}
