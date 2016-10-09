'use strict';

import {property} from 'nsclient/common/decorators';
import {generateIV, generateKey, createKeyDerivation, encrypt} from 'nscommon/services/crypto';

const config = __PASSPROTECT_CONFIG__.crypto;

export class User extends Backbone.Model {
	@property
	static urlRoot = '/api/users';

	@property
	static idAttribute = '_id';

	@property
	static validation = {
		_id: {
			required: true,
			msg: 'error:user.400._id'
		},
		password: {
			minLength: 8,
			msg: 'error:user.400.password'
		},
		passwordRepeat: {
			equalTo: 'password',
			msg: 'error:user.400.passwordRepeat'
		}
	};

	/**
	 * Check if the model is new.
	 *
	 * Return true if we force is new or if the model has the id property.
	 *
	 * @returns {boolean} true if is new.
	 */
	isNew() {
		return this.forceIsNew || super.isNew();
	}

	/**
	 * Register the user to the server.
	 *
	 * To register a user to a server, the user the creation and the definition of some keys.
	 *
	 * @returns {Promise} Promise of the registered user.
	 */
	registerUser() {
		this.forceIsNew = true;

		const salt = generateIV(config.ivSize);
		const masterKey = generateKey(config.keySize);
		const masterKeyKey = salt.then(salt => createKeyDerivation(this.get('password'), salt, config.pbkdf2));

		const encryptedKey = Promise.props({
			masterKey,
			masterKeyKey
		}).then(obj => encrypt(obj.masterKey, obj.masterKeyKey.key, obj.masterKeyKey.iv, config.cypherIv));

		return Promise.props({
			salt,
			encryptedKey
		}).then(obj => {
			this.set('encryption', _.pick(obj, 'salt', 'encryptedKey'));

			return this.save();
		});
	}
}
