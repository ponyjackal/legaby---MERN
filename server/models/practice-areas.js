'use strict';
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');

class PracticeAreas extends MongoModels {
}

PracticeAreas.collection = 'practice_areas';

module.exports = PracticeAreas;
