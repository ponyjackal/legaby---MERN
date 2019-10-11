'use strict';
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');

class Degrees extends MongoModels {
}

Degrees.collection = 'degrees';

module.exports = Degrees;
