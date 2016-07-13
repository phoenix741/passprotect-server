'use strict';

var _ = require('underscore');

module.exports = extendGlobal;

function extendGlobal(globalObject) {
	_.extend(globalObject, {});
}
