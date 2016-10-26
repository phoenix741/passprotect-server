'use strict';

const debug = require('debug')('App:Service:LineTransaction');
const NotFoundError = require('../models/exception').NotFoundError;
const crypto = require('crypto');

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

			return models.transaction.getTransactions(filter, params.offset, params.limit);
		},

		createTransaction(type, before, after) {
			const base = after || before;
			if (!base) {
				return null;
			}

			const transaction = {
				type,
				line: base._id,
				user: base.user,
				before: before,
				after: after,
				updatedAt: base.updatedAt,
				sha512: after && crypto.createHash('sha512').update(after.encryption.informations.content).digest('hex')
			};

			return models.transaction.create(transaction);
		}
	};
};
