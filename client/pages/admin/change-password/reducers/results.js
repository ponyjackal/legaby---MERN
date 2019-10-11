'use strict';
const Constants = require('../constants');
const ObjectAssign = require('object-assign');
const ParseValidation = require('../../../../helpers/parse-validation');

const initialState = {
    hydrated: false,
    loading: false,
    showSaveSuccess: false,
    error: undefined,
    hasError: {},
    help: {}
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
      showSaveSuccess: !action.err,
      error: validation.error
    });
  }

  if (action.type === Constants.HIDE_PASSWORD_SAVE_SUCCESS) {
    return ObjectAssign({}, state, {
      showSaveSuccess: false
    });
  }

  return state;
};


module.exports = reducer;

