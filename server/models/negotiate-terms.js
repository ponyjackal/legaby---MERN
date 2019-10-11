'use strict';
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');

class NegotiateTerms extends MongoModels {
}

NegotiateTerms.collection = 'negotiate_terms';

module.exports = NegotiateTerms;
