'use strict';

const debug = require('debug')('App:Service:User');
const _ = require('underscore');
const Promise = require('bluebird');
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

		getClearUser(id, password) {
			debug('Get the clear version of the user with id', id);
			const userPromise = this.getUser(id);
			const generateMasterKeyKeyPromise = userPromise.then(user => {
				const salt = user.encryption.salt;

				return services.crypto.createKeyDerivation(password, salt);
			});
			const decryptedKeyPromise = Promise.props({
				user: userPromise,
				masterKeyKey: generateMasterKeyKeyPromise
			}).then(props => {
				const key = props.masterKeyKey.key;
				const iv = props.masterKeyKey.iv;
				const encryptedKey = props.user.encryption.key;

				return services.crypto.decrypt(encryptedKey, key, iv);
			});

			return Promise.props({
				user: userPromise,
				key: decryptedKeyPromise
			}).then(obj => {
				obj.user.clearKey = obj.key.toString('binary');

				return obj.user;
			});
		},

		/**
		 * Create an object that can be used in the JWT token.
		 * @param {Object} user clear user
		 * @returns {Promise} promise on the token.
		 */
		createSessionUser(user) {
			debug('Create the session payload for user ', user._id);
			const payload = _.pick(user, '_id');

			const encryptionKey = user.clearKey;

			return services.crypto
				.encrypt(encryptionKey, user.encryption.sessionKey, user.encryption.salt)
				.then(function (encryptedKey) {
					payload.clearKey = encryptedKey;

					return payload;
				});
		},

		getUserFromSession(payload) {
			debug('Get the user for the payload ', payload._id);
			const userPromise = this.getUser(payload._id);
			const decryptedKeyPromise = userPromise.then(user => {
				const encryptedKey = payload.clearKey;

				return services.crypto.decrypt(encryptedKey, user.encryption.sessionKey, user.encryption.salt);
			});

			return Promise.props({
				user: userPromise,
				key: decryptedKeyPromise
			}).then(obj => {
				obj.user.clearKey = obj.key;

				return obj.user;
			});
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
			const hashPasswordPromise = services.crypto.hashPassword(user.password);
			const generateSaltPromise = services.crypto.generateIV();
			const generateMasterKeyPromise = services.crypto.generateKey();
			const generateSessionKeyPromise = services.crypto.generateKey();
			const generateMasterKeyKeyPromise = generateSaltPromise.then(salt => services.crypto.createKeyDerivation(user.password, salt));

			const encryptKeyPromise = Promise.props({
				masterKey: generateMasterKeyPromise,
				masterKeyKey: generateMasterKeyKeyPromise
			}).then(obj => services.crypto.encrypt(obj.masterKey, obj.masterKeyKey.key, obj.masterKeyKey.iv));

			return Promise.props({
				hash: hashPasswordPromise,
				salt: generateSaltPromise,
				key: encryptKeyPromise,
				sessionKey: generateSessionKeyPromise
			}).then(obj => {
				user.password = obj.hash;
				user.encryption = _.pick(obj, 'salt', 'key', 'sessionKey');

				return models.user.registerUser(user);
			});
		}
	};
};
