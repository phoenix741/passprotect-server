'use strict';

import {list,detail,create} from './itemsController';
import routesEventService from 'nsclient/common/services/routesEventService';
import {property} from 'nsclient/common/decorators';

class Router extends Marionette.AppRouter {
	@property
	static appRoutes = {
		'items': 'list',
		'items/:id': 'detail',
		'items/add/:type': 'create'
	};
}

const API = {list, detail, create};

export default function itemsRouter(application) {
	routesEventService.on('items:list', () => {
		application.navigate('items');
		API.list();
	});
	routesEventService.on('items:detail', (id) => {
		application.navigate('items/' + id);
		API.detail(id);
	});
	routesEventService.on('items:create', (type) => {
		application.navigate('items/add' + type);
		API.create(type);
	});

	new Router({ // eslint-disable-line no-new
		controller: API
	});
}
