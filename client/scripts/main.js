'use strict';

import '../css/passprotect.scss';

import './bootstrap/materializecss';
import resBundle from 'i18next-resource-store-loader!nscommon/locales';

import application from 'nsclient/application';
import router from 'nsclient/router';

import 'nsclient/common/plugins';
import 'nsclient/common/services/errorsService';

import routesEventService from 'nsclient/common/services/routesEventService';

// Configure backbone
Backbone.emulateHTTP = true;
Backbone.$ = jQuery;

const i18nOptions = {
	resources: resBundle,
	lng: 'fr-FR',
	joinArrays: '+'
};

const i18nInitPromise = Promise.fromCallback((cb) => i18n.init(i18nOptions, cb)).then((t) => {
	window.t = t;
});

application.on('start', () => {
	router(application);

	if (Backbone.history) {
		Backbone.history.start();

		if (application.getCurrentRoute() === '') {
			routesEventService.trigger('items:list');
		}
	}
});

i18nInitPromise.then(() => {
	application.start();
});
