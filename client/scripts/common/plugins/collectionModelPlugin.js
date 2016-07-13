'use strict';

// All collection contains an "items" attribute, so we should use it by default.
Backbone.Collection.prototype.parse = function (data) {
	if (data) {
		return data.items || data;
	}
	return null;
};

Backbone.Collection.prototype.isAllValid = function (option) {
	let valid = true;
	this.each((item) => {
		valid = valid && item.isValid(option);
	});
	return valid;
};
