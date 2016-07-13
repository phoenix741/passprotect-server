'use strict';

// Photoliste application
import application from 'nsclient/application';
import {ErrorDialogView} from 'nsclient/common/views/errorDialogView';

const alertTemplate = _.template('<div class="col s12"><div class="card red darken-1"><div class="card-content white-text"><span class="card-title"><%= title %></span><p><%= content %></p></span></div></div></div>');

export function showAlert(view, title, text) {
	if (title || text) {
		view.$el.find('.alert').addClass('row');
		view.$el.find('.alert').html(alertTemplate({title: title, content: text}));

		// Go to the top
		$('html,body').animate({scrollTop: view.$el.find('.alert').offset().top}, 'slow');
	}
	else {
		view.$el.find('.alert').removeClass('row');
		view.$el.find('.alert').html('');
	}
}

export function hideAlert(view) {
	showAlert(view);
}

export function alert(view, message, title) {
	const errorDialogView = new ErrorDialogView({model: new Backbone.Model({message: message, title: title})});

	application.errorDialogRegion.show(errorDialogView);
}

/**
 * Show a toast message while 15 sec.
 *
 * @param {Object} view The view that call the toast message
 * @param {String} message The message to show.
 */
export function showToast(view, message) {
	Materialize.toast(message, 15000);
}
