'use strict';

import debug from 'debug';
import _ from 'lodash';
import {AuthorizationError} from 'server/models/exception';
import {getUsers as getUsersModel, getUser as getUserModel,registerUser as registerUserModel} from 'server/models/user';
import {hashPassword, checkPassword} from './crypto';

const log = debug('App:Service:User');

export function getUsers(params = {}) {
	log('Get all users with params ', params);

	const filter = _.pick(params, 'confirmationToken');

	return getUsersModel(filter);
}

export function getUser(id) {
	log('Get the user with id', id);
	return getUserModel(id);
}

/**
 * Create an object that can be used in the JWT token.
 * @param {Object} user clear user
 * @returns {Promise} promise on the token.
 */
export function createSessionUser(user) {
	log('Create the session payload for user ', user._id);
	const payload = _.pick(user, '_id');

	return Promise.resolve(payload);
}

export function getUserFromSession(payload) {
	log('Get the user for the payload ', payload._id);

	return getUser(payload._id);
}

export function verifyPassword(user, password) {
	log('Verify the password of the user ', user._id);

	return checkPassword(password, user.password)
		.then(isValid => {
			if (!isValid) {
				throw new AuthorizationError('User or password invalid');
			}
		})
		.return(user);
}

export function registerUser(user) {
	log(`Create the user with the id ${user._id}`);

	user.creationAt = new Date();

	const hashPasswordPromise = hashPassword(user.password);

	return hashPasswordPromise
		.then(hash => {
			user.password = hash;
			return registerUserModel(user);
		});
}
