'use strict';

_.extend(Backbone.Validation.callbacks, {
	valid: function (view, attr, selector) {
		const fieldName = view.prefix ? view.prefix + attr : attr,
			$el = view.$('[name="' + fieldName + '"]'),
			$group = $el.closest('.input-field'),
			helper = view.helper || {},
			fieldHelper = helper[fieldName];

		$group.find('input, textarea').removeClass('invalid');
		$group.find('.help-block').html(fieldHelper).addClass('hidden');
	},
	invalid: function (view, attr, error, selector) {
		const fieldName = view.prefix ? view.prefix + attr : attr,
			$el = view.$('[name="' + fieldName + '"]'),
			$group = $el.closest('.input-field');

		$group.find('input, textarea').addClass('invalid');
		$group.find('.help-block').html(i18n.t(error)).removeClass('hidden');
	}
});

 _.extend(Backbone.Validation.validators, {
	validModel: function (value, attr, customValue, model) {
		if (value && !value.isValid(true)) {
			return 'Invalid ' + attr;
		}
		return null;
	},
	validCollection: function (value, attr, customValue, model) {
		const errors = value.map((entry) => entry.isValid(true));

		if (_.indexOf(errors, false) !== -1) {
			return 'Invalid collection of ' + attr;
		}
		return null;
	}
});
