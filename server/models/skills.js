'use strict';
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');

class Skills extends MongoModels {
}

Skills.collection = 'skills';

module.exports = Skills;
