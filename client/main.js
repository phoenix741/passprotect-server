'use strict'

import 'any-promise/register/bluebird'
import 'babel-polyfill'

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import {init as i18nInit} from 'i18next'
import resBundle from '../common/locales'
import Promise from 'bluebird'
import Vuetify from 'vuetify'
import veeDictionary from 'vee-validate/dist/locale/fr'
import VeeValidate, { Validator } from 'vee-validate'

import {apolloProvider} from './utils/graphql'
import {checkAuth} from './components/user/UserService'

global.Promise = Promise

Validator.addLocale(veeDictionary)

Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.use(VeeValidate, {errorBagName: 'veeErrors', locale: 'fr'})

const i18nOptions = {
  resources: resBundle,
  lng: 'fr-FR',
  joinArrays: '+'
}

const i18nInitPromise = Promise
  .fromCallback((cb) => i18nInit(i18nOptions, cb))
  .then(trans => {
    window.trans = trans
    Vue.prototype.trans = trans
  })

i18nInitPromise.then(() => {
  checkAuth()

  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    apolloProvider,
    template: '<App/>',
    components: { App }
  })
})
