import 'any-promise/register/bluebird'
import Vue from 'vue'
import Vuetify from 'vuetify'
import VeeValidate from 'vee-validate'

Vue.use(Vuetify)
Vue.use(VeeValidate, {errorBagName: 'veeErrors'})

Vue.config.productionTip = false
Vue.prototype.trans = text => text

// require all test files (files that ends with .spec.js)
const testsContext = require.context('./specs', true, /\.spec$/)
testsContext.keys().forEach(testsContext)

// require all src files except main.js for coverage.
// you can also change this to match only the subset of files that
// you want coverage for.
const srcContext = require.context('../../client', true, /^\.\/(?!main(\.js)?|index\.pug$)/)
srcContext.keys().forEach(srcContext)
