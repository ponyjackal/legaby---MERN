'use strict';
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');

class SavedJobs extends MongoModels {
}

SavedJobs.collection = 'saved_jobs';

module.exports = SavedJobs;
