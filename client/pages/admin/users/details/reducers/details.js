'use strict';
const Constants = require('../constants');
const ObjectAssign = require('object-assign');
const ParseValidation = require('../../../../../helpers/parse-validation');


const initialState = {
    hydrated: false,
    loading: false,
    showFetchFailure: false,
    showSaveSuccess: false,
    error: undefined,
    hasError: {},
    help: {},
    _id: undefined,
    status: undefined,
    is_bar_id_valid: undefined,
    first_name: undefined,
    last_name: undefined,
    email: undefined,
    role: undefined,
    freeze_activity: undefined
};
const reducer = function (state = initialState, action) {
    if (action.type === Constants.GET_DETAILS) {
        return ObjectAssign({}, initialState, {
            hydrated: false,
            loading: true
        });
    }

    if (action.type === Constants.GET_DETAILS_RESPONSE) {
        const validation = ParseValidation(action.response);

        return ObjectAssign({}, state, {
            hydrated: true,
            loading: false,
            showFetchFailure: !!action.err,
            error: validation.error,
            _id: action.response._id,
            status: action.response.status,
            is_bar_id_valid: action.response.is_bar_id_valid,
            first_name: action.response.first_name,
            last_name: action.response.last_name,
            email: action.response.email,
            role: action.response.role,
            freeze_activity: action.response.freeze_activity
        });
    }

    if (action.type === Constants.SAVE_DETAILS) {
        return ObjectAssign({}, state, {
            loading: true,
            status: action.request.data.status,
            is_bar_id_valid: action.request.is_bar_id_valid,
            first_name: action.request.data.first_name,
            last_name: action.request.last_name,
            email: action.request.data.email,
            role: action.request.role,
            freeze_activity: action.request.freeze_activity
        });
    }

    if (action.type === Constants.SAVE_DETAILS_RESPONSE) {
        const validation = ParseValidation(action.response);
        const stateUpdates = {
            loading: false,
            showSaveSuccess: !action.err,
            error: validation.error,
            hasError: validation.hasError,
            help: validation.help
        };

        if (action.response.hasOwnProperty('email')) {
            stateUpdates.status = action.response.status;
            stateUpdates.is_bar_id_valid = action.response.is_bar_id_valid;
            stateUpdates.first_name = action.response.first_name;
            stateUpdates.last_name = action.response.last_name;
            stateUpdates.email = action.response.email;
            stateUpdates.freeze_activity = action.response.freeze_activity;
        }
        return ObjectAssign({}, state, stateUpdates);
    }

    if (action.type === Constants.HIDE_DETAILS_SAVE_SUCCESS) {
        return ObjectAssign({}, state, {
            showSaveSuccess: false
        });
    }

    return state;
};


module.exports = reducer;
