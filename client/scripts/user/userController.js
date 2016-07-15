'use strict';

import application from 'nsclient/application';
import routesEventService from 'nsclient/common/services/routesEventService';
import {clearErrors,entitySaveFailed,displayErrors} from 'nsclient/common/utils/viewUtils';
import {showToast,alert} from 'nsclient/common/utils/alertUtils';
import {LoginView,RegisterView} from './userView';

import {Session} from 'nsclient/common/entities/session';
import {User} from 'nsclient/common/entities/user';

export function login(username, password) {
	// Show the login dialog popup view
	const user = new Session({username: username, password: password});

	if (username) {
		loginToServer(null, user);
	}
	else {
		application.dialogRegion.startTracking();

		const view = new LoginView({model: user});

		view.on('form:submit', data => loginToServer(view, user));
		view.on('user:signup', () => {
			view.trigger('dialog:close');
			routesEventService.trigger('user:register');
		});

		application.dialogRegion.show(view);
	}
}

export function logout() {
	Session.logout();
}

export function register() {
	application.bodyRegion.startTracking();

	const user = new User();
	const view = new RegisterView({model: user});

	user.setForceIsNew(true);

	view.on('form:submit', function () {
		// Save the username and the password before registring to the server
		const username = user.get('_id');
		const password = user.get('password');

		user.save().then(function () {
			// Call a login of the user
			showToast(view, i18n.t('user:register.flash.user_created'));
			clearErrors(view);

			routesEventService.trigger('login', username, password);
		}).catch(_.partial(entitySaveFailed, 'user_controller_register', view)).done();
	});

	application.bodyRegion.show(view);
}

export function loginToServer(view, user) {
	user
		.save()
		.then(() => {
			if (view) {
				view.trigger('dialog:close');
			}

			return Session.registerUser(user);
		})
		.then(() => Backbone.history.loadUrl())
		.catch(error => {
			Session.unregisterUser();
			if (error.status === 401) {
				const errors = {username: i18n.t('user:login.form.username.help.invalid')};

				if (view) {
					displayErrors(view, errors);
					return;
				}
			}
			alert(null, i18n.t('user:login.form.username.help.unknown'));
		})
		.done();
}
