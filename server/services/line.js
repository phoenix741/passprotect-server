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
				const salt = line.salt;
				const informationsEncrypted = line.encryptedInformations;

				const generateLineKeyPromise = services.crypto.createKeyDerivation(user.clearKey, salt);

				return generateLineKeyPromise
					.then(lineKey => services.crypto.decrypt(informationsEncrypted, lineKey.key, lineKey.iv))
					.then(function (informationString) {
						line.informations = JSON.parse(informationString);

						return line;
					});
			});
		},

		saveLine(line, user) {
			debug('Create the line of type ', line.type);

			const informations = line.informations;
			const informationsString = JSON.stringify(informations);

			const generateSaltPromise = services.crypto.generateIV();
			const generateLineKeyPromise = generateSaltPromise.then(salt => services.crypto.createKeyDerivation(user.clearKey, salt));

			return Promise.props({
				salt: generateSaltPromise,
				lineKey: generateLineKeyPromise
			}).then(props => {
				return services.crypto.encrypt(new Buffer(informationsString, 'utf-8'), props.lineKey.key, props.lineKey.iv).then(function (informationEncrypted) {
					line.salt = props.salt;
					line.encryptedInformations = informationEncrypted;
					delete line.informations;

					return models.line.saveLine(line);
				});
			}).then(function (updateLine) {
				updateLine.informations = informations;
				return updateLine;
			});
		},

		removeLine(id) {
			debug(`Remove the line with the id ${id}`);

			return models.line.removeLine(id);
		}
	};
};
