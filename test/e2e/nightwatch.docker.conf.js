const _ = require('lodash')
const config = require('../../config')
const nightwatch = require('./nightwatch.conf')

module.exports = _.merge({}, nightwatch, {
  selenium: {
    start_process: false,
    host: 'selenium'
  },

  test_settings: {
    default: {
      selenium_port: 4444,
      selenium_host: 'selenium',
      silent: true,
      globals: {
        devServerURL: 'http://test:' + (process.env.PORT || config.dev.port)
      }
    }
  }
})
