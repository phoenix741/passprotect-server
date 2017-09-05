const path = require('path')
process.env.NODE_CONFIG_DIR = path.join(__dirname, '..', 'config')

require = require('@std/esm')(module) // eslint-disable-line no-global-assign
module.exports = require('./app.mjs').default
