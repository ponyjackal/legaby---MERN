'use strict';
const CreateNew = require('./reducers/create-new');
const Redux = require('redux');
const Results = require('./reducers/results');
const Logout = require('./reducers/logout');


module.exports = Redux.createStore(
    Redux.combineReducers({
        createNew: CreateNew,
        results: Results,
        logout: Logout
    })
);
