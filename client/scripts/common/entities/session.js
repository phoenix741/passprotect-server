'use strict';

import routesEventService from 'nsclient/common/services/routesEventService';
import {property} from 'nsclient/common/decorators';
import BackboneSession from 'backbone-session';
import {decrypt, createKeyDerivation} from 'nscommon/services/crypto';

const config = __PASSPROTECT_CONFIG__.crypto;

export class SessionServer extends Backbone.Model {
	@property
	static urlRoot = '/api/session';

	@property
	static validation = {
		username: {
			required: true,
			msg: 'error:user.400._id'
		},
		password: {
			required: true,
			msg: 'error:user.400.password'
		}
	};

	signIn(username, password, options) {
		this.set({username, password});

		return this.save(options).then(() => this._load());
	}

	signOut(options) {
		return $.ajax({url: '/api/session', method: 'DELETE'});
	}

	_load() {
		const password = this.get('password');
		const salt = this.get('encryption').salt;

		const masterKeyKeyPromise = createKeyDerivation(password, salt, config.pbkdf2);

		return masterKeyKeyPromise.then(masterKeyKey => {
			const key = masterKeyKey.key;
			const iv = masterKeyKey.iv;
			const encryptedKey = this.get('encryption').encryptedKey;

			return decrypt(encryptedKey, key, iv, config.cypherIv);
		}).then(key => {
			this.set('clearKey', key.toString('binary'));

			return this;
		});
	}
}

export class SessionStorage extends BackboneSession {
	@property
	static Model = SessionServer;

	initialize(properties, options) {
		super.initialize(properties, options);

		this.serverSession = new SessionServer();
	}

	signIn(username, password, options) {
		return this.serverSession
			.signIn(username, password, options)
			.then(() => {
				this.set({
					username: this.serverSession.get('username'),
					clearKey: this.serverSession.get('clearKey'),
					token: this.serverSession.get('token')
				});

				return this.save();
			})
			.then(() => Backbone.history.loadUrl());
	}

	signOut(options) {
		return super.signOut()
			.then(() => this.serverSession.signOut(options))
			.then(() => Backbone.history.loadUrl());
	}

	getAuthStatus(options) {
		return new Promise(function (resolve, reject) {
			if (this.get('clearKey') && this.get('token')) {
				resolve();
			}
			else {
				reject();
			}
		});
	}
}
