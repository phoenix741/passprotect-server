'use strict';

import {init as i18nInit} from 'i18next';
import resBundle from 'i18next-resource-store-loader!nscommon/locales';
import Promise from 'bluebird';
import Vue from 'vue';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import VueApollo from 'vue-apollo';
import veeDictionary from 'vee-validate/dist/locale/fr';
import VeeValidate, { Validator } from 'vee-validate';

import App from './App.vue';
import Login from './user/Login.vue';
import Register from './user/Register.vue';
import Items from './items/Items.vue';
import ItemModification from './items/ItemModification.vue';
import ItemCreation from './items/ItemCreation.vue';
import About from './page/About.vue';
import {apolloClient} from './utils/graphql';
import {checkAuth} from './user/UserService';

Validator.addLocale(veeDictionary);

Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.use(VueApollo);
Vue.use(VeeValidate, {errorBagName: 'veeErrors', locale: 'fr'});

// Set the promise as global
window.Promise = Promise;

const i18nOptions = {
	resources: resBundle,
	lng: 'fr-FR',
	joinArrays: '+'
};

const i18nInitPromise = Promise
	.fromCallback((cb) => i18nInit(i18nOptions, cb))
	.then(trans => {
		window.trans = trans;
		Vue.prototype.trans = trans;
	});

const routes = [
	{path: '/about', component: About},
	{path: '/items', component: Items},
	{path: '/items/type/:type', component: ItemCreation, props: true},
	{path: '/items/:id', component: ItemModification, props: true},
	{path: '/login', component: Login},
	{path: '/register', component: Register},
	{path: '*', redirect: '/items'}
];

const router = new VueRouter({routes});
const apolloProvider = new VueApollo({defaultClient: apolloClient});

i18nInitPromise.then(() => {
	checkAuth();

	new Vue({
		el: '#app',
		render: h => h(App),
		router,
		apolloProvider
	});
});
