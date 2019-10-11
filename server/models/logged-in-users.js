'use strict';
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');

class LoggedInUsers extends MongoModels {
}

LoggedInUsers.collection = 'logged_in_users';

module.exports = LoggedInUsers;
