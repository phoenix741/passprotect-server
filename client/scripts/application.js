'use strict';

import {SessionStorage} from 'nsclient/common/entities/session';

class ProjectApplication extends Marionette.Application {
	initialize() {
		this.session = new SessionStorage();
	}

	getCurrentRoute() {
		return Backbone.history.fragment;
	}

	navigate(route, options) {
		options = options || {};
		Backbone.history.navigate(route, options);
	}

	getSession() {
		return this.session;
	}
}

export default new ProjectApplication();
