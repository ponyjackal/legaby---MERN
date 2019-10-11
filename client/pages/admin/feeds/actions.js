'use strict';
const ApiActions = require('../../../actions/api');
const Constants = require('./constants');
const Store = require('./store');
const Qs = require('qs');

class Actions {

	static getPostJobsDetails(data) {
		ApiActions.get(
      '/api/users/my/getPostJobs',
      data,
      Store,
      Constants.GET_DETAILS,
      Constants.GET_DETAILS_RESPONSE
    );
	}
}

module.exports = Actions;

