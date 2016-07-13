'use strict';

export default class DialogRegion extends Marionette.Region {
	onShow(view) {
		this.listenTo(view, 'dialog:close', this.closeDialog);

		this.$el.openModal({
			complete: () => {
				this.closeDialog();
			}
		});
	}

	closeDialog() {
		this.stopListening();
		this.empty();
		this.$el.closeModal();
	}
}
