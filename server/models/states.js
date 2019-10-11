'use strict';
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');

class States extends MongoModels {
}

States.collection = 'states';

module.exports = States;
