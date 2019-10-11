'use strict';
const Async = require('async');
const Bcrypt = require('bcrypt');
const Boom = require('boom');
const Config = require('../../config');
const Joi = require('joi');


const internals = {};


internals.applyRoutes = function (server, next) {
    //const AuthAttempt = server.plugins['hapi-mongo-models'].AuthAttempt;
    const Session = server.plugins['hapi-mongo-models'].Session;
    const User = server.plugins['hapi-mongo-models'].User;


    server.route({
        method: 'POST',
        path: '/login',
        config: {
            validate: {
                payload: {
                    username: Joi.string().lowercase().required(),
                    password: Joi.string().required()
                }
            },
            plugins: {
                crumb: false
            },
            pre: [{
                assign: 'abuseDetected',
                method: function (request, reply) {

                    const ip = request.info.remoteAddress;
                    const username = request.payload.username;

                    // AuthAttempt.abuseDetected(ip, username, (err, detected) => {

                    //     if (err) {
                    //         return reply(err);
                    //     }

                    //     if (detected) {
                    //         return reply(Boom.badRequest('Maximum number of auth attempts reached. Please try again later.'));
                    //     }

                    //     reply();
                    // });
                    reply();
                }
            }, {
                assign: 'user',
                method: function (request, reply) {

                    const username = request.payload.username;
                    const password = request.payload.password;

                    User.findByCredentials(username, password, (err, user) => {
                        if (err) {
                            return reply(Boom.badRequest('Username and password combination not found.'));
                        }
                        if (user.role !== 'admin') {
                            return reply(Boom.badRequest('You are not authorized to access this account.'));
                        }

                        reply(user);
                    });
                }
            },
            {
                assign: 'logAttempt',
                method: function (request, reply) {
                    if (request.pre.user) {
                        return reply();
                    }

                    // const ip = request.info.remoteAddress;
                    // const username = request.payload.username;

                    // AuthAttempt.create(ip, username, (err, authAttempt) => {

                    //     if (err) {
                    //         return reply(err);
                    //     }

                    //     return reply(Boom.badRequest('Username and password combination not found or account is inactive.'));
                    // });
                    reply();
                }
            },
            {
                assign: 'session',
                method: function (request, reply) {

                    Session.create(request.pre.user._id.toString(), (err, session) => {

                        if (err) {
                            return reply(err);
                        }

                        return reply(session);
                    });
                }
            }]
        },
        handler: function (request, reply) {

            const credentials = request.pre.session._id.toString() + ':' + request.pre.session.key;
            const authHeader = 'Basic ' + new Buffer(credentials).toString('base64');

            const result = {
                user: {
                    _id: request.pre.user._id,
                    username: request.pre.user.email,
                    email: request.pre.user.email,
                    role: request.pre.user.role
                },
                session: request.pre.session,
                authHeader
            };

            request.cookieAuth.set(result);

            reply(result);
        }
    });


    server.route({
        method: 'POST',
        path: '/login/forgot',
        config: {
            validate: {
                payload: {
                    email: Joi.string().email().required()
                }
            },
            plugins: {
                crumb: false
            },
            pre: [{
                assign: 'user',
                method: function (request, reply) {

                    const conditions = {
                        email: request.payload.email,
                        role: 'admin'
                    };

                    User.findOne(conditions, (err, user) => {

                        if (err) {
                            return reply(err);
                        }

                        if (!user) {
                            return reply(Boom.badRequest('Email doesn\'t exist.'));
                        }

                        reply(user);
                    });
                }
            }]
        },
        handler: function (request, reply) {

            const mailer = request.server.plugins.mailer;

            Async.auto({
                keyHash: function (done) {

                    Session.generateKeyHash(done);
                },
                user: ['keyHash', function (results, done) {

                    const id = request.pre.user._id.toString();
                    const update = {
                        $set: {
                            forgot_pass:  {
                                token: results.keyHash.hash,
                                created_at: new Date()
                            }
                        }
                    };

                    User.findByIdAndUpdate(id, update, done);
                }],
                email: ['user', function (results, done) {

                    const emailOptions = {
                        subject: 'Reset your ' + Config.get('/projectName') + ' password',
                        to: request.payload.email
                    };
                    const template = 'forgot-password';
                    const context = {
                        baseHref: Config.get('/baseUrl') + '/login/reset/' + results.user.email + '/' + results.keyHash.key,
                        firstName: results.user.first_name,
                        lastName: results.user.last_name,
                        hostPath: Config.get('/baseUrl'),
                        imgPath: Config.get('/baseUrl') + '/public/media/logo-white@2x.png'
                    };

                    mailer.sendEmail(emailOptions, template, context, done);
                }]
            }, (err, results) => {

                if (err) {
                    return reply(err);
                }

                reply({ success: true });
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/login/validateToken',
        config: {
            validate: {
                payload: {
                    key: Joi.string().required(),
                    email: Joi.string().email().required()
                }
            },
            plugins: {
                crumb: false
            },
            pre: [{
                assign: 'user',
                method: function(request, reply) {
                    const key = request.payload.key;
                    const conditions = {
                        email: request.payload.email,
                        role: 'admin'
                    };
                    User.findOne(conditions, (err, user) => {
                        if(err || !user.forgot_pass) {
                            return reply(Boom.badRequest('Invalid Link.'));
                        }
                        let token = user.forgot_pass.token;
                        Bcrypt.compare(key, token, reply);
                        //reply(user);
                    });
                }
            },]
        },
        handler: function (request, reply) {
            let user = request.pre.user;
            if(!user) {
                return reply(Boom.badRequest('Invalid email or key.'));
            }
            reply(user);
        }
    });


    server.route({
        method: 'POST',
        path: '/login/reset',
        config: {
            validate: {
                payload: {
                    key: Joi.string().required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().required(),
                    passwordConfirm: Joi.string().required()
                }
            },
            plugins: {
                crumb: false
            },
            pre: [
            {
                assign: 'user',
                method: function (request, reply) {

                    const conditions = {
                        email: request.payload.email,
                        role: 'admin'
                    };

                    User.findOne(conditions, (err, user) => {

                        if (err) {
                            return reply(err);
                        }

                        if (!user) {
                            return reply(Boom.badRequest('Invalid email or key.'));
                        }

                        if (!user.forgot_pass) {
                            return reply(Boom.badRequest('Invalid link.'));
                        }

                        reply(user);
                    });
                }
            }]
        },
        handler: function (request, reply) {

            Async.auto({
                keyMatch: function (done) {

                    const key = request.payload.key;
                    const token = request.pre.user.forgot_pass.token;
                    Bcrypt.compare(key, token, done);
                },
                passwordHash: ['keyMatch', function (results, done) {

                    let reqTime = new Date(request.pre.user.forgot_pass.created_at);
                    let expireTime = reqTime.setHours(request.pre.user.forgot_pass.created_at.getHours()+3);

                    if((new Date() > new Date(expireTime))) {
                        return reply(Boom.badRequest('The link has been expired.'));
                    }

                    if (!results.keyMatch) {
                        return reply(Boom.badRequest('Invalid link or link has been expired.'));
                    }

                    User.generatePasswordHash(request.payload.password, done);
                }],
                user: ['passwordHash', function (results, done) {

                    if (request.payload.password === request.payload.passwordConfirm) {
                        const id = request.pre.user._id.toString();
                        const update = {
                            $set: {
                                password: results.passwordHash.hash
                            },
                            $unset: {
                                forgot_pass: undefined
                            }
                        };

                        User.findByIdAndUpdate(id, update, done);
                    } else {
                        return reply(Boom.badRequest('Password and Confirm Password does not match.'));
                    }
                }]
            }, (err, results) => {

                if (err) {
                    return reply(err);
                }

                reply({ success: true });
            });
        }
    });


    next();
};


exports.register = function (server, options, next) {

    server.dependency(['mailer', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'login'
};
