'use strict';
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');

class PostJobs extends MongoModels {
}

PostJobs.collection = 'post_jobs';

module.exports = PostJobs;
