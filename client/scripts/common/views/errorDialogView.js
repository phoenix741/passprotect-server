'use strict';

import template from 'nscommon/templates/common/errors_dialog.jade';
import {property} from 'nsclient/common/decorators';

export class ErrorDialogView extends Marionette.ItemView {
	@property
	static template = template;

	@property
	static title = i18n.t('alert.unknown_error.title');
}
