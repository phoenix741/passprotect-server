'use strict';

import application from 'nsclient/application';
import routesEventService from 'nsclient/common/services/routesEventService';
import {HeaderLayout, HeaderMenu, HeaderMobileMenu} from './headerView';
import menu from './entities/menu';

export function showHeader() {
	const headerLayout = new HeaderLayout();

	// Showing the header need to get the current user:
	//  * If no user we should show a login view in the menu ?
	//  * If the use is connected we should show the menu according to
	// the rights of the user.
	//
	// The menu can be refreshed when the session state changed. (A
	// login or logout event occure).
	application.getSession().on('change', function () {
		// Refresh the header
		menu.fetchHeaders(application.getSession().get('username'));
	});

	const menuCollection = menu.fetchHeaders(application.getSession().get('username'));
	const headerMenu = new HeaderMenu({collection: menuCollection});
	const headerMobileMenu = new HeaderMobileMenu({collection: menuCollection});

	headerLayout.on('render', function () {
		headerLayout.showChildView('menu', headerMenu);
		headerLayout.showChildView('menuMobile', headerMobileMenu);
	});

	headerMenu.on('childview:childview:navigate', navigateMenu);
	headerMenu.on('childview:navigate', navigateMenu);
	headerMobileMenu.on('childview:childview:navigate', navigateMenu);
	headerMobileMenu.on('childview:navigate', navigateMenu);

	application.getView().showChildView('headerRegion', headerLayout);

	headerLayout.on('brand:clicked', function () {
		routesEventService.trigger('items:list');
	});
}

function navigateMenu() {
	const menu = arguments[arguments.length - 1];
	routesEventService.trigger(menu.get('navigationTrigger'), menu.get('navigationParams'));
}
