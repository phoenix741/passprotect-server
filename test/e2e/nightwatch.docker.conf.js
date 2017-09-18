const _ = require('lodash')
const nightwatch = require('./nightwatch.conf')

module.exports = _.merge({}, nightwatch, {
  selenium: {
    start_process: false
  }
})
