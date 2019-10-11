'use strict';
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');

class EmploymentTypes extends MongoModels {
}

EmploymentTypes.collection = 'employment_types';

module.exports = EmploymentTypes;
