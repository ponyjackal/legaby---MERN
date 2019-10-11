'use strict';
const Constants = require('../constants');
const ObjectAssign = require('object-assign');
const ParseValidation = require('../../../../helpers/parse-validation');

const initialState = {
    hydrated: false,
    loading: false,
    error: undefined,
    data: '',
    totalJobs: 0
};

const reducer = function (state = initialState, action) {
	if (action.type === Constants.GET_DETAILS) {
    return ObjectAssign({}, state, {
        hydrated: false,
        loading: true
    });
  }

  if (action.type === Constants.GET_DETAILS_RESPONSE) {
    const validation = ParseValidation(action.response);
    return ObjectAssign({}, state, {
      hydrated: true,
      loading: false,
      error: validation.error,
      data: action.response.data,
      totalJobs: action.response.totalJobs
    });
  }

  return state;
};


module.exports = reducer;

