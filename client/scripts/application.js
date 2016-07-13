'use strict';

class ProjectApplication extends Marionette.Application {
	getCurrentRoute() {
		return Backbone.history.fragment;
	}

	navigate(route, options) {
		options = options || {};
		Backbone.history.navigate(route, options);
	}
}

export default new ProjectApplication();
