'use strict';
const Confidence = require('confidence');
const Config = require('./config.js');


const criteria = {
    env: process.env.NODE_ENV
};


const manifest = {
    $meta: 'This file defines the admin site configuration.',
    server: {
        debug: {
            request: ['error']
        },
        connections: {
            routes: {
                security: true
            }
        }
    },
    connections: [{
        port: Config.get('/port/web'),
        labels: ['web'],
        state: {
            isHttpOnly: false,
            isSecure: {
                $filter: 'env',
                production: true,
                $default: false
            }
        }
    }],
    registrations: [
        {
            plugin: 'inert'
        },
        {
            plugin: 'hapi-auth-cookie'
        },
        {
            plugin: {
                register: 'crumb',
                options: {
                    restful: true
                }
            }
        },
        {
            plugin: 'vision'
        },
        {
            plugin: {
                register: 'visionary',
                options: {
                    engines: { jsx: 'hapi-react-views' },
                    compileOptions: {
                        removeCacheRegExp: '.jsx'
                    },
                    relativeTo: __dirname,
                    path: './server/web'
                }
            }
        },
        {
            plugin: 'hapi-csv'
        },
        {
            plugin: {
                register: 'hapi-mongo-models',
                options: {
                    mongodb: Config.get('/hapiMongoModels/mongodb'),
                    models: {
                        Session: './server/models/session',
                        User: './server/models/user',
                        PostJobs: './server/models/post-jobs',
                        SavedJobs: './server/models/saved-jobs',
                        JobStatus: './server/models/job-status',
                        NegotiateTerms: './server/models/negotiate-terms',
                        LoggedInUsers: './server/models/logged-in-users',
                        PracticeAreas: './server/models/practice-areas',
                        WorkLocations: './server/models/work-locations',
                        EmploymentTypes: './server/models/employment-types',
                        States: './server/models/states',
                        Skills: './server/models/skills',
                        Degrees: './server/models/degrees',
                        Categories: './server/models/categories'
                    },
                    autoIndex: Config.get('/hapiMongoModels/autoIndex')
                }
            }
        },
        {
            plugin: './server/auth'
        },
        {
            plugin: './server/mailer'
        },
        // {
        //     plugin: './server/api/accounts',
        //     options: {
        //         routes: { prefix: '/api' }
        //     }
        // },
        // {
        //     plugin: './server/api/admin-groups',
        //     options: {
        //         routes: { prefix: '/api' }
        //     }
        // },
        // {
        //     plugin: './server/api/admins',
        //     options: {
        //         routes: { prefix: '/api' }
        //     }
        // },
        {
            plugin: './server/api/auth-attempts',
            options: {
                routes: { prefix: '/api' }
            }
        },
        // {
        //     plugin: './server/api/contact',
        //     options: {
        //         routes: { prefix: '/api' }
        //     }
        // },
        {
            plugin: './server/api/index',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/login',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/logout',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/sessions',
            options: {
                routes: { prefix: '/api' }
            }
        },
        // {
        //     plugin: './server/api/signup',
        //     options: {
        //         routes: { prefix: '/api' }
        //     }
        // },
        // {
        //     plugin: './server/api/statuses',
        //     options: {
        //         routes: { prefix: '/api' }
        //     }
        // },
        {
            plugin: './server/api/users',
            options: {
                routes: { prefix: '/api' }
            }
        },
        // {
        //     plugin: './server/web/account'
        // },
        {
            plugin: './server/web/admin'
        },
        {
            plugin: './server/web/main'
        },
        {
            plugin: './server/web/public'
        }
    ]
};


const store = new Confidence.Store(manifest);


exports.get = function (key) {
    //console.log("key........ "+ key)

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
