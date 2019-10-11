'use strict';
// const Account = require('./account');
// const Admin = require('./admin');
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');
const Config = require('../../config');


class User extends MongoModels {
    static generatePasswordHash(password, callback) {
        const salt = Config.get('/salt');
        Bcrypt.hash(password, salt, function(err, results) {
            if (err) {
                return callback(err);
            }

            return callback(null, {
                password,
                hash: results
            });
        })
    }

    static  passwordValidator(password) {
        const PASSWORD_REGEXP = /^(?=.{8,})(?=.*[a-zA-Z0-9!@#$%^&*()]).*$/;
        if(!!password && PASSWORD_REGEXP.test(password)){
            var count = 1, counter = 1;
            for (var i = 0; i < password.length; i++) {
              if (password[i] == password[i+1]) {
                count++;
              } else {
                if (Math.abs(password.charCodeAt(i+1) - password.charCodeAt(i)) === 1) {
                  counter++;
                } else {
                  return true;
                }
              }

              if(count == password.length || counter == password.length){
                return false;
              }
            }
        } else {
            return false;
        }
    }

    static create(username, password, email, callback) {

        const self = this;

        Async.auto({
            passwordHash: this.generatePasswordHash.bind(this, password),
            newUser: ['passwordHash', function (results, done) {

                const document = {
                    isActive: true,
                    username: username.toLowerCase(),
                    password: results.passwordHash.hash,
                    email: email.toLowerCase(),
                    timeCreated: new Date()
                };

                self.insertOne(document, done);
            }]
        }, (err, results) => {

            if (err) {
                return callback(err);
            }

            results.newUser[0].password = results.passwordHash.password;

            callback(null, results.newUser[0]);
        });
    }

    static findByCredentials(username, password, callback) {

        const self = this;
        Async.auto({
            user: function (done) {

                const query = {
                    //isActive: true
                };
                query.email = username;
                // if (username.indexOf('@') > -1) {
                //     query.email = username.toLowerCase();
                // }
                // else {
                //     query.username = username.toLowerCase();
                // }

                self.findOne(query, done);
            },
            passwordMatch: ['user', function (results, done) {

                if (!results.user) {
                    return done(true, null);
                }
                const source = results.user.password;
                Bcrypt.compare(password, source, done);
            }]
        }, (err, results) => {
            if (err) {
                return callback(err);
            }

            if (results.passwordMatch) {
                return callback(null, results.user);
            } else {
                return callback(!results.passwordMatch, null);
            }
        });
    }

    static findByUsername(username, callback) {

        const query = { email: username.toLowerCase() };

        this.findOne(query, callback);
    }

    constructor(attrs) {

        super(attrs);

        Object.defineProperty(this, '_roles', {
            writable: true,
            enumerable: false
        });
    }

    canPlayRole(role) {

        if (!this.roles) {
            return false;
        }

        return this.roles.hasOwnProperty(role);
    }

    // hydrateRoles(callback) {

    //     if (!this.roles) {
    //         this._roles = {};
    //         return callback(null, this._roles);
    //     }

    //     if (this._roles) {
    //         return callback(null, this._roles);
    //     }

    //     const self = this;
    //     const tasks = {};

    //     if (this.roles.account) {
    //         tasks.account = function (done) {

    //             Account.findById(self.roles.account.id, done);
    //         };
    //     }

    //     if (this.roles.admin) {
    //         tasks.admin = function (done) {

    //             Admin.findById(self.roles.admin.id, done);
    //         };
    //     }

    //     Async.auto(tasks, (err, results) => {

    //         if (err) {
    //             return callback(err);
    //         }

    //         self._roles = results;

    //         callback(null, self._roles);
    //     });
    // }
}


User.collection = 'users';

module.exports = User;
