'use strict';
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');

class Categories extends MongoModels {
}

Categories.collection = 'categories';

module.exports = Categories;
