'use strict';

const debug = require('debug')('App:Service:LineTransaction');
const NotFoundError = require('../models/exception').NotFoundError;

module.exports = function (models, services) {
	return {
		getTransactions(user, params) {
			debug(`Get all transaction of the user ${user._id}`);
			if (params.limit === 0) {
				return Promise.resolve([]);
			}

			const filter = {};
			filter.user = user._id;
			filter.earliest = params.earliest;

			return models.linetransaction.getTransactions(filter, params.offset, params.limit);
		}
	};
};
