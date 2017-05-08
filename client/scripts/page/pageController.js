'use strict';

import application from 'nsclient/application';
import {AboutView} from './pageView';

export function about() {
	application.getView().getRegion('bodyRegion').startTracking();
	const view = new AboutView();
	application.getView().showChildView('bodyRegion', view);
}
