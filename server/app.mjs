import 'dotenv/config'

import { bootstrap as bootstrapI18N } from './utils/i18n'
import { bootstrap as bootstrapApollo } from './utils/apollo'

bootstrapI18N()
bootstrapApollo()
