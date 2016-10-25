'use strict';

const debug = require('debug')('App:Service:Line');
const NotFoundError = require('../models/exception').NotFoundError;

module.exports = function (models, services) {
	return {
		getLines(user, params) {
			debug('Get all lines from user ', user._id);
			if (params.limit === 0) {
				return Promise.resolve([]);
			}

			const filter = {};
			filter.user = user._id;

			return models.line.getLines(filter, params.offset, params.limit);
		},

		getLine(id, user) {
			debug(`Get the line with id ${id}`);
			return models.line.getLine(id);
		},

		saveLine(line, user) {
			debug(`Create the line of type ${line.type}`);

			line.updatedAt = new Date();

			return getLineIfAvailable(line._id, line._rev).then(function (oldLine) {
				return models.line.saveLine(line).tap(function (newLine) {
					return models.linetransaction.createTransaction(oldLine, newLine);
				});
			});
		},

		removeLine(id) {
			debug(`Remove the line with the id ${id}`);

			return getLineIfAvailable(id).tap(function () {
				return models.line.removeLine(id);
			}).tap(function (oldLine) {
				return models.linetransaction.createTransaction(oldLine);
			});
		}
	};

	function getLineIfAvailable(id, rev) {
		return models.line.getLine(id, rev).catch(NotFoundError, () => null);
	}
};
