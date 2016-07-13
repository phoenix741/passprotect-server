'use strict';

const passport = require('passport');
const permission = require('permission');

module.exports.authenticate = () => passport.authenticate(['authHeader', 'cookie'], {session: false});
module.exports.permission = permission;
