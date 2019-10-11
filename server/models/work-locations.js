'use strict';
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');

class WorkLocations extends MongoModels {
}

WorkLocations.collection = 'work_locations';

module.exports = WorkLocations;
