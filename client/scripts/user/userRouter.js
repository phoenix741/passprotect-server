'use strict';

import {login,logout,register} from './userController';
import routesEventService from 'nsclient/common/services/routesEventService';

const API = {login, logout, register};

export default function userRouter(application) {
	routesEventService.on('login', (username, password) => API.login(username, password));
	routesEventService.on('logout', () => API.logout());
	routesEventService.on('user:register', () => API.register());
}
