'use strict';

import template from 'nscommon/templates/common/errors_dialog.pug';
import {property} from 'nsclient/common/decorators';

export class ErrorDialogView extends Marionette.View {
	@property
	static template = template;

	@property
	static title = i18n.t('alert.unknown_error.title');
}
