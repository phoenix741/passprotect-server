'use strict';

import application from 'nsclient/application';
import {alert} from 'nsclient/common/utils/alertUtils';

import MissingPageView from 'nsclient/common/views/missingPageView';

window.onerror = function (msg, url, linenumber, column, error) {
	// Track the error
	if (error && error.status === 404) {
		application.bodyRegion.show(new MissingPageView());
		return;
	}

	alert(null, i18n.t('alert.unknown_error.message'), i18n.t('alert.unknown_error.title'));

	throw error;
};

window.onunhandledrejection = function (error) {
	if (!error.event) {
		error.event = 'Promise';
	}

	throw error;
};
