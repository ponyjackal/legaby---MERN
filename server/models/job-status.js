'use strict';
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');

class JobStatus extends MongoModels {
}

JobStatus.collection = 'job_statuses';

module.exports = JobStatus;
