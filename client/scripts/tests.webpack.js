'use strict';
// this file is used by webpack to create a bundle of all unit tests and then is passed to karma
const _ = require('underscore');
const testsContext = require.context('.', true, /.+\.test\.jsx?$/);
let keys = testsContext.keys();
keys = _.filter(keys, function (key) {
	return !/main.*\.test\.js/i.test(key);
});

keys.forEach(testsContext);
