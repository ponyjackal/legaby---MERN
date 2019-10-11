'use strict';
const ApiActions = require('../../../actions/api');
const Constants = require('./constants');
const Store = require('./store');
const Qs = require('qs');

class Actions {

	static changePassword(data) {
		ApiActions.put(
      '/api/users/my/changePassword',
      data,
      Store,
      Constants.GET_RESULTS,
      Constants.GET_RESULTS_RESPONSE
    );
	}
	static hidePasswordSaveSuccess() {

    Store.dispatch({
      type: Constants.HIDE_PASSWORD_SAVE_SUCCESS
    });
  }
}


module.exports = Actions;
