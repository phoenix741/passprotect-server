'use strict';

export default class BodyRegion extends Marionette.Region {
	attachHtml(view) {
		this.$el.hide();
		this.$el.html(view.el);
		this.$el.fadeIn('fast');
	}
}
