'use strict';

import application from 'nsclient/application';
import routesEventService from 'nsclient/common/services/routesEventService';
import {clearErrors,entitySaveFailed,displayErrors} from 'nsclient/common/utils/viewUtils';
import {showToast,alert} from 'nsclient/common/utils/alertUtils';
import {LoginView,RegisterView} from './userView';
import {User} from 'nsclient/common/entities/user';
import {SessionServer} from 'nsclient/common/entities/session';

export function login(username, password) {
	if (username) {
		loginToServer(null, username, password);
	}
	else {
		application.dialogRegion.startTracking();

		const model = new SessionServer({username, password});
		const view = new LoginView({model});

		view.on('form:submit', data => loginToServer(view, model.get('username'), model.get('password')));
		view.on('user:signup', () => {
			view.trigger('dialog:close');
			routesEventService.trigger('user:register');
		});

		application.dialogRegion.show(view);
	}
}

export function logout() {
	application.getSession().signOut();
}

export function register() {
	application.bodyRegion.startTracking();

	const user = new User();
	const view = new RegisterView({model: user});

	view.on('form:submit', function () {
		// Save the username and the password before registring to the server
		const username = user.get('_id');
		const password = user.get('password');

		user.registerUser().then(function () {
			// Call a login of the user
			showToast(view, i18n.t('user:register.flash.user_created'));
			clearErrors(view);

			routesEventService.trigger('login', username, password);
		}).catch(_.partial(entitySaveFailed, 'user_controller_register', view)).done();
	});

	application.bodyRegion.show(view);
}

export function loginToServer(view, username, password) {
	application.getSession()
		.signIn(username, password)
		.then(() => view && view.trigger('dialog:close'))
		.catch(error => {
			$('.pageLoader').hide();

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
