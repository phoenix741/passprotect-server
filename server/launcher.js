const path = require('path')

process.env.NODE_CONFIG_DIR = path.join(__dirname, '..', 'config')

require('babel-register')
const app = require('./app')
module.exports = app.default
