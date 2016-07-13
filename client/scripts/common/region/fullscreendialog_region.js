'use strict';

import application from 'nsclient/application';

export default class FullscreenDialogRegion extends Marionette.Region {
	onShow(view) {
		// On show we hide the header, body and footer.
		application.headerRegion.$el.hide();
		application.bodyRegion.$el.hide();

		this.listenTo(view, 'dialog:close', this.closeDialog);
	}

	onEmpty(view) {
		// On empty we restore all views.
		application.headerRegion.$el.show();
		application.bodyRegion.$el.show();
	}

	closeDialog() {
		this.stopListening();
		this.empty();
	}
}
