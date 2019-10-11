'use strict';
const Constants = require('../constants');
const ObjectAssign = require('object-assign');
const ParseValidation = require('../../../../helpers/parse-validation');

const initialState = {
    hydrated: false,
    loading: false,
    error: undefined,
    data: '',
    key: ''
};

const reducer = function (state = initialState, action) {
	if (action.type === Constants.GET_RESULTS) {
    return ObjectAssign({}, state, {
        hydrated: false,
        loading: true
    });
  }

  if (action.type === Constants.GET_RESULTS_RESPONSE) {
    const validation = ParseValidation(action.response);
    return ObjectAssign({}, state, {
      hydrated: true,
      loading: false,
      error: validation.error,
      data: action.response.data,
      key: action.response.key
    });
  }

  return state;
};


module.exports = reducer;

