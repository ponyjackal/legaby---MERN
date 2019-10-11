'use strict';
const ApiActions = require('../../../actions/api');
const Constants = require('./constants');
const Store = require('./store');
const Qs = require('qs');

class Actions {

	static getExoprtUserData(data) {
		ApiActions.get(
      '/api/users/export',
      data,
      Store,
      Constants.GET_RESULTS,
      Constants.GET_RESULTS_RESPONSE
    );
	}

	static getExoprtJobsData(data) {
		ApiActions.get(
      '/api/users/postJobs',
      data,
      Store,
      Constants.GET_RESULTS,
      Constants.GET_RESULTS_RESPONSE
    );
	}


}


module.exports = Actions;
