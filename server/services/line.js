'use strict';

const debug = require('debug')('App:Service:Line');

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
			return models.line.saveLine(line);
		},

		removeLine(id) {
			debug(`Remove the line with the id ${id}`);

			return models.line.removeLine(id);
		}
	};
};
