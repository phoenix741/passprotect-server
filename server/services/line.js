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
			debug('Get the line with id', id);
			return models.line.getLine(id).then(function (line) {
				const informationsEncrypted = line.encryptedInformations;

				return services.crypto.decrypt(informationsEncrypted, new Buffer(user.clearKey, 'binary'), user.encryption.iv).then(function (informationString) {
					line.informations = JSON.parse(informationString);

					return line;
				});
			});
		},

		saveLine(line, user) {
			debug('Create the line of type ', line.type);

			const informations = line.informations;
			const informationsString = JSON.stringify(informations);

			return services.crypto.encrypt(new Buffer(informationsString, 'utf-8'), new Buffer(user.clearKey, 'binary'), user.encryption.iv).then(function (informationEncrypted) {
				line.encryptedInformations = informationEncrypted;
				delete line.informations;

				return models.line.saveLine(line).then(function (updateLine) {
					updateLine.informations = informations;
					return updateLine;
				});
			});
		}
	};
};
