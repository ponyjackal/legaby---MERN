'use strict';
const Result = require('./reducers/results');
const Redux = require('redux');

module.exports = Redux.createStore(
    Redux.combineReducers({
        result: Result
    })
);
