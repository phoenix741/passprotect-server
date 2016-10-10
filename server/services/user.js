'use strict';

const debug = require('debug')('App:Service:User');
const _ = require('underscore');
const AuthorizationError = require('../models/exception').AuthorizationError;

module.exports = function (models, services) {
	return {
		getUsers(params) {
			debug('Get all users with params ', params);
			if (params.limit === 0) {
				return Promise.resolve([]);
			}

			const filter = _.pick(params, 'confirmationToken');

			return models.user.getUsers(filter, params.offset, params.limit);
		},

		getUser(id) {
			debug('Get the user with id', id);
			return models.user.getUser(id);
		},

		/**
		 * Create an object that can be used in the JWT token.
		 * @param {Object} user clear user
		 * @returns {Promise} promise on the token.
		 */
		createSessionUser(user) {
			debug('Create the session payload for user ', user._id);
			const payload = _.pick(user, '_id');

			return Promise.resolve(payload);
		},

		getUserFromSession(payload) {
			debug('Get the user for the payload ', payload._id);

			return this.getUser(payload._id);
		},

		verifyPassword(user, password) {
			debug('Verify the password of the user ', user._id);

			return services.crypto.checkPassword(password, user.password)
				.then(isValid => {
					if (!isValid) {
						throw new AuthorizationError('User or password invalid');
					}
				})
				.return(user);
		},

		registerUser(user) {
			debug(`Create the user with the id ${user._id}`);

			user.creationAt = new Date();

			const hashPasswordPromise = services.crypto.hashPassword(user.password);

			return hashPasswordPromise.then(hash => {
				user.password = hash;
				return models.user.registerUser(user);
			});
		}
	};
};
