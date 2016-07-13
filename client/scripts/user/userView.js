'use strict';

import loginTemplate from 'nscommon/templates/user/login.jade';
import registerTemplate from 'nscommon/templates/user/register.jade';
import {property} from 'nsclient/common/decorators';
import {ValidationView,MaterializeForm,FormView} from 'nsclient/common/behaviors';

export class LoginView extends Marionette.ItemView {
	@property
	static template = loginTemplate;

	@property
	static title = i18n.t('user:login.dialog.title');

	@property
	static triggers = {
		'click .dialog-close': 'dialog:close',
		'click .signup': 'user:signup',
		'click .forgotten': 'user:forgotten'
	};

	@property
	static behaviors = {
		'ValidationView': {
			behaviorClass: ValidationView
		},
		'MaterializeForm': {
			behaviorClass: MaterializeForm
		},
		'FormView': {
			behaviorClass: FormView
		}
	};

	@property
	static bindings = {
		'#_username': 'username',
		'#_password': 'password'
	};
}

export class RegisterView extends Marionette.ItemView {
	@property
	static template = registerTemplate;

	@property
	static behaviors = {
		'ValidationView': {
			behaviorClass: ValidationView
		},
		'MaterializeForm': {
			behaviorClass: MaterializeForm
		},
		'FormView': {
			behaviorClass: FormView
		}
	};

	@property
	static bindings = {
		'#username': '_id',
		'#password': 'password',
		'#passwordRepeat': 'passwordRepeat'
	};
}
