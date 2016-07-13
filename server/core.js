'use strict';

const _ = require('underscore');
const debug = require('debug')('App:Core');
const i18n = require('i18next');

const path = require('path');
const express = require('express');

class Core {
	constructor(app) {
		this.model = this.getModels();
		this.services = this.getServices(this.model);

		this.createControllers(app, this.services);
	}

	getModels() {
		const models = {};

		models.user = require('./models/user')();
		models.line = require('./models/line')();

		return models;
	}

	getServices(models) {
		const services = {};

		services.user = require('./services/user')(models, services);
		services.line = require('./services/line')(models, services);
		services.crypto = require('./services/crypto')(models, services);

		return services;
	}

	createControllers(app, services) {
		require('./config-passport')(app, services);
		require('./controllers/user')(app, services);
		require('./controllers/session')(app, services);
		require('./controllers/line')(app, services);

		app.use(express.static(path.join(__dirname, '..', 'dist', 'dev')));

		app.use((err, req, res, next) => {
			debug(err);

			if (err && err.name === 'ValidationError') {
				const json = _(err.errors)
					.chain()
					.map(value => _.pick(value, 'path', 'message', 'kind', 'name'))
					.indexBy('path')
					.value();

				return res.status(400).json({code: 400, message: json});
			}
			if (err && err.name === 'DuplicateKeyError') {
				return res.status(400).json({code: 400, message: {
					[err.field]: i18n.t('error:global.400.duplicate')
				}});
			}

			if (err && err.status) {
				return res.status(err.status).send({code: err.status, message: err.message});
			}

			return res.status(500).send({code: 500, message: i18n.t('error:global.500.unknown')});
		});
	}

	run() {

	}
}

module.exports = Core;
