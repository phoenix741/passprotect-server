'use strict';

import application from 'nsclient/application';
import {ItemsView, ItemDetailView, RemoveConfirmView} from './itemsView';
import {Items, Item} from '../common/entities/items';
import routesEventService from 'nsclient/common/services/routesEventService';
import {clearErrors, entitySaveFailed, entityFetchFailed} from 'nsclient/common/utils/viewUtils';
import {showToast} from 'nsclient/common/utils/alertUtils';

export function list() {
	application.bodyRegion.startTracking();

	Items.fetchItems().then(function (collection) {
		const view = new ItemsView({collection});
		view.on('childview:item:remove', function (view, options) {
			showConfirmationRemove(options.model);
		});
		view.on('childview:item:detail', function (view, options) {
			routesEventService.trigger('items:detail', options.model.get('_id'));
		});
		view.on('item:add-credit-card', function () {
			routesEventService.trigger('items:create', 'card');
		});
		view.on('item:add-password', function () {
			routesEventService.trigger('items:create', 'password');
		});
		view.on('item:add-text', function () {
			routesEventService.trigger('items:create', 'text');
		});

		application.bodyRegion.show(view);

		return null;
	}).catch(_.partial(entityFetchFailed, 'item_controller_detail')).done();
}

export function detail(id) {
	application.dialogRegion.startTracking();

	Item.fetchItem(id).then(function (model) {
		const view = new ItemDetailView({model});
		view.on('form:submit', function () {
			model.save().then(function () {
				// Call a login of the user
				showToast(view, i18n.t('items:item.flash.item_modify'));
				clearErrors(view);

				view.trigger('dialog:close');
			}).catch(_.partial(entitySaveFailed, 'item_controller_detail', view)).done();
		});
		view.on('dialog:close', () => routesEventService.trigger('items:list'));

		application.dialogRegion.show(view);

		return null;
	}).catch(_.partial(entityFetchFailed, 'item_controller_detail')).done();
}

export function create(type) {
	application.dialogRegion.startTracking();

	const model = new Item({type});
	const view = new ItemDetailView({model});
	view.on('form:submit', function () {
		model.save().then(function () {
			// Call a login of the user
			showToast(view, i18n.t('items:item.flash.item_created'));
			clearErrors(view);

			view.trigger('dialog:close');
		}).catch(_.partial(entitySaveFailed, 'item_controller_register', view)).done();
	});
	view.on('dialog:close', () => routesEventService.trigger('items:list'));

	application.dialogRegion.show(view);
}

function showConfirmationRemove(model) {
	application.errorDialogRegion.startTracking();

	const removeConfirmView = new RemoveConfirmView({model});
	removeConfirmView.on('agree', function () {
		model.destroy().then(function () {
			// Call a login of the user
			showToast(removeConfirmView, i18n.t('items:item.flash.item_removed'));
			clearErrors(removeConfirmView);
		}).catch(_.partial(entitySaveFailed, 'item_controller_destroy', removeConfirmView)).done();
	});

	application.errorDialogRegion.show(removeConfirmView);
}
