'use strict';

import application from 'nsclient/application';
import {AboutView} from './pageView';

export function about() {
	const view = new AboutView();
	application.bodyRegion.show(view);
}
