const config = require('config')

module.exports = {
  NODE_ENV: '"production"',
  __PASSPROTECT_CONFIG__: JSON.stringify(config.get('config.client'))
}
