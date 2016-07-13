'use strict';

import {hideAlert} from 'nsclient/common/utils/alertUtils';
import {property} from 'nsclient/common/decorators';

export class StickitView extends Marionette.Behavior {
	onRender() {
		this.view.stickit();
	}

	onDestroy() {
		this.view.unstickit();
	}
}

/**
 * View used to add validation to a model bound to a form.
 */
export class ValidationView extends Marionette.Behavior {
	initialize() {
		Backbone.Validation.bind(this.view, this.view.options);
	}

	remove() {
		Backbone.Validation.unbind(this.view);
		return Backbone.View.prototype.remove.apply(this.view, arguments);
	}
}

export class MaterializeForm extends Marionette.Behavior {
	@property
	static ui = {
		textFields: 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], textarea',
		textarea: '.materialize-textarea',
		tooltipped: '.tooltipped',
		filefield: '.file-field',
		datepicker: '.datepicker',
		select: 'select',
		helper: '.help-block'
	};

	updateTextField(field) {
		if (field.val().length > 0 || field.attr('placeholder') !== undefined || field[0].validity.badInput === true) {
			field.siblings('label, i').addClass('active');
		}
		else {
			field.siblings('label, i').removeClass('active');
		}
	}

	onShow() {
		const behavior = this;
		this.ui.textFields.each(function() {
			behavior.updateTextField($(this));
			$(this).characterCounter();
		});
		this.ui.textarea.each(function() {
			$(this).trigger('keydown');
		});
		this.ui.filefield.each(function() {
			const path_input = $(this).find('input.file-path');
			$(this).find('input[type="file"]').change(function () {
				if ($(this)[0].files.length > 0) {
					path_input.val($(this)[0].files[0].name);
					path_input.trigger('change');
				}
			});
		});
		this.ui.tooltipped.tooltip();
		this.ui.datepicker.each(function(index, e) {
			const je = $(e);
			const name = je.attr('name');
			je.pickadate({
				onSet: function() {
					const hiddenInput = $('input[name="' + name + '"]');
					hiddenInput.change();
				}
			});
		});
		this.ui.select.not('.initialized').material_select();
		this.ui.helper.each(function(index, e) {
			const je = $(e);
			if (je.text()) {
				const name = je.data('name');
				behavior.view.helper = behavior.view.helper || {};
				behavior.view.helper[name] = je.html();
			}
		});
	}
}

/**
 * Special view used to manage forms.
 *
 * <p>The form is bound to the model when intialized.</p>
 * <p>When an attribute of the form is changed, the model is updated and
 * validated, when the form is submitted the model is updated and validated.</p>
 */
export class FormView extends StickitView {
	@property
	static events = {
		'submit form': 'submitClicked'
	};

	submitClicked(e, options) {
		if (e) {
			e.preventDefault();
		}

		if (this.view.model.isValid(true)) {
			hideAlert(this.view);
			this.view.trigger('form:submit', this.view.model);
			return true;
		}

		return false;
	}
}
