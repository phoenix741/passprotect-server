'use strict';

const path = require('path');
const debug = require('debug')('app:bootstrap');
const i18nMiddleware = require('i18next-express-middleware');
const i18nBackend = require('i18next-node-fs-backend');

module.exports = (environment) => {
	// Init i18n
	const i18n = require('i18next');
	const i18nOption = {
		ns: ['translation', 'error', 'contact', 'user'],
		lng: 'fr',
		fallbackLng: 'fr',
		backend: {
			loadPath: path.join(__dirname, '..', 'common', 'locales', '{{lng}}', '{{ns}}.json'),
			addPath: path.join(__dirname, '..', 'common', 'locales', '{{lng}}', '{{ns}}.missing.json')
		},

		saveMissing: environment === 'development'
		//debug: environment === 'development'
	};

	debug('Define the i18n options with ' + i18nOption);

	i18n
		.use(i18nMiddleware.LanguageDetector)
		.use(i18nBackend)
		.init(i18nOption);
};
