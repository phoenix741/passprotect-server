'use strict'
process.env.BROWSER_ENV = 'cordova'

const promise = require('../../build/build.js')
module.exports = function (ctx) {
  const deferral = ctx.requireCordovaModule('q').defer()
  promise.then(deferral.resolve).catch(deferral.reject)
  return deferral.promise
}
