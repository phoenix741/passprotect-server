'use strict';

import {about} from './pageController';
import routesEventService from 'nsclient/common/services/routesEventService';
import {property} from 'nsclient/common/decorators';

class Router extends Marionette.AppRouter {
	@property
	static appRoutes = {
		'about': 'about'
	};
}

const API = {about};

export default function userRouter(application) {
	routesEventService.on('page:about', () => {
		application.navigate('about');
		API.about();
	});

	new Router({ // eslint-disable-line no-new
		controller: API
	});
}
