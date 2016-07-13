'use strict';

import {showAlert} from './alertUtils';
import routesEventService from 'nsclient/common/services/routesEventService';

export function displayErrors(view, errors) {
	_.each(errors, function (val, attr) {
		Backbone.Validation.callbacks.invalid(view, attr, val, 'name');
	});

	view.model.trigger('validated', false, view.model, errors.fields);
	view.model.trigger('validated:invalid', view.model, errors.fields);

	if (errors.globals && errors.globals.length > 0) {
		showAlert(view, i18n.t('app.alert.validation.title'), errors.globals.join(', '));
	}
}

export function clearErrors(view) {
	view.$el.find('.input-field input').removeClass('invalid');
	view.$el.find('.input-field .help-block').html('').addClass('hidden');
}

export function entityFetchFailed(event, error) {
	$('.pageLoader').hide();
	if (error.status && error.status === 401) {
		routesEventService.trigger('login');
		return;
	}

	error.event = event;
	throw error;
}

export function entitySaveFailed(event, view, error) {
	if (error.status && error.status === 400 /* Bad request */) {
		const errors = error.responseJSON.message;
		displayErrors(view, errors);

		return;
	}

	throw error;
}
