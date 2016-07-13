'use strict';

import {property} from 'nsclient/common/decorators';

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

	setForceIsNew(isNew) {
		this.forceIsNew = isNew;
	}

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
}
