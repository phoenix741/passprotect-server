'use strict';

import routesEventService from 'nsclient/common/services/routesEventService';
import {property} from 'nsclient/common/decorators';

export class SessionStorage extends Backbone.Model {
	@property
	static defaults = {
		authenticated: false,
		user: null
	}
}

const currentSession = new SessionStorage();
let currentSessionInitialized = false;

/**
 * Object used to get session information from the API.
 */
export class Session extends Backbone.Model {
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

	static getSession() {
		return new Promise(function (resolve) {
			if (currentSessionInitialized) {
				resolve(currentSession);
				return;
			}

			currentSessionInitialized = true;

			const serverSession = new Session();
			serverSession.fetch()
				.then(() => currentSession.set({authenticated: true, user: serverSession}))
				.catch(() => currentSession.set({authenticated: false, user: null}))
				.finally(() => resolve(currentSession));
		});
	}

	static getSessionUser() {
		return Session.getSession()
			.then(session => {
				// Need authentification
				if (!session.get('user')) {
					throw new Error('Need authentification');
				}

				return session.get('user');
			})
			.catch(() => routesEventService.trigger('login'));
	}

	static registerUser(user) {
		return Session.getSession()
			.then(currentSession => {
				currentSession.set({authenticated: true, user: user});
				routesEventService.trigger('session:registerUser', user);
			});
	}

	static unregisterUser() {
		return Session.getSession()
			.then(currentSession => {
				currentSession.set({authenticated: false, user: null});
				routesEventService.trigger('session:unregisterUser');
			});
	}

	static logout() {
		return $.ajax({
			url: '/api/session',
			method: 'DELETE'
		}).done(() => {
			Session.unregisterUser();
			Backbone.history.loadUrl();

			return null;
		});
	}
}
