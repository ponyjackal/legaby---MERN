/* global window */
'use strict';
const ApiActions = require('../../../actions/api');
const Constants = require('./constants');
const ForgotStore = require('./forgot/store');
const LoginStore = require('./home/store');
const LogoutStore = require('./logout/store');
const Qs = require('qs');
const ResetStore = require('./reset/store');


class Actions {
    static forgot(data) {

        ApiActions.post(
            '/api/login/forgot',
            data,
            ForgotStore,
            Constants.FORGOT,
            Constants.FORGOT_RESPONSE
        );
    }

    static getUserCreds() {
        if (!global.window) {
            return;
        }

        ApiActions.get(
            '/api/users/my',
            undefined,
            LoginStore,
            Constants.GET_USER_CREDS,
            Constants.GET_USER_CREDS_RESPONSE,
            (err, response) => {

                if (!err) {
                    const query = Qs.parse(window.location.search.substring(1));

                    if (query.returnUrl) {
                        window.location.href = query.returnUrl;
                    }
                    else if (response) {
                        if (response.role == 'admin') {
                           window.location.href = '/admin/users';
                        }
                        else {
                            window.location.href = '/login';
                        }
                    }
                }
            }
        );
    }

    static login(data) {

        ApiActions.post(
            '/api/login',
            data,
            LoginStore,
            Constants.LOGIN,
            Constants.LOGIN_RESPONSE,
            (err, response) => {

                if (!err) {
                    const query = Qs.parse(window.location.search.substring(1));
                    if (query.returnUrl) {
                        window.location.href = query.returnUrl;
                    }
                    if (response && response.user.role) {
                       if (response.user.role === 'admin') {
                           window.location.href = '/admin/users';
                        }
                        else {
                            window.location.href = '/login';
                        }
                    }
                }
            }
        );
    }

    static logout() {

        ApiActions.delete(
            '/api/logout',
            undefined,
            LogoutStore,
            Constants.LOGOUT,
            Constants.LOGOUT_RESPONSE
        );
    }

    static validateToken(data) {
        ApiActions.post(
            '/api/login/validateToken',
            data,
            ResetStore,
            Constants.VALIDATE,
            Constants.VALIDATE_RESPONSE
        );

    }

    static reset(data) {

        ApiActions.post(
            '/api/login/reset',
            data,
            ResetStore,
            Constants.RESET,
            Constants.RESET_RESPONSE
        );
    }
}


module.exports = Actions;
