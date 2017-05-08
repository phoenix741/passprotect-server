'use strict';

import 'backbone-validation';
import 'backbone.stickit';

import './backbone.fetch';
import './collectionModelPlugin';
import './validationExtendPlugin';

import entitiesEventService from '../services/entitiesEventService';

entitiesEventService.on('before', () => $('.pageLoader').show());
entitiesEventService.on('after', () => $('.pageLoader').hide());

Backbone.Validation.configure({
	forceUpdate: true
});

Backbone.Stickit.addHandler({
	selector: '*',
	setOptions: {validate: true},
	afterUpdate: function($el) {
		$el.trigger('change');
	}
});
