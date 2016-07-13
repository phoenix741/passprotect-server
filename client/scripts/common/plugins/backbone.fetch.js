'use strict';

import Backbone from 'backbone';
import _ from 'underscore';

import entitiesEventService from '../services/entitiesEventService';

const backboneModelFetch = Backbone.Model.prototype.fetch;
const backboneModelSave = Backbone.Model.prototype.save;
const backboneModelDestroy = Backbone.Model.prototype.destroy;

const backboneCollectionFetch = Backbone.Collection.prototype.fetch;

function callBackboneMethod(model, methodName, method) {
	entitiesEventService.trigger('before', methodName, model);

	const methodArguments = _.toArray(arguments).slice(2);
	return new Promise(function (resolve, reject) {
		const response = method.apply(model, methodArguments);
		$.when(response).done(function () {
			resolve(model);
		}).fail(function (model, xhr) {
			if (model.responseText !== null && model.responseText !== undefined) {
				xhr = model;
				model = null;
			}

			const error = new Error(xhr.statusText);
			error.xhr = xhr;
			error.status = xhr.status;
			error.responseText = xhr.responseText;
			error.responseJSON = response.responseJSON;

			reject(error);
		}).done(function() {
			entitiesEventService.trigger('after', methodName, model);
		});
	});
}

Backbone.Model.prototype.fetch = function (options) {
	options = options || {};
	if (options.cache === undefined) {
		options.cache = true;
		options.expires = 30; // 30 secondes. The goals is mainly for server side loading, or for quick navigation
	}

	return callBackboneMethod(this, 'fetch', backboneModelFetch, options);
};

Backbone.Model.prototype.save = function(key, val, options) {
	return callBackboneMethod(this, 'save', backboneModelSave, key, val, options);
};

Backbone.Model.prototype.destroy = function(options) {
	return callBackboneMethod(this, 'destroy', backboneModelDestroy, options);
};

Backbone.Collection.prototype.fetch = function(options) {
	options = options || {};
	if (options.cache === undefined) {
		options.cache = true;
		options.expires = 30; // 30 secondes. The goals is mainly for server side loading, or for quick navigation
	}

	return callBackboneMethod(this, 'fetch', backboneCollectionFetch, options);
};
