'use strict';
const Confidence = require('confidence');
const Dotenv = require('dotenv');


Dotenv.config({ silent: true });

const criteria = {
    env: process.env.NODE_ENV
};

const config = {
    $meta: 'This file configures the Legably application.',
    projectName: 'Legably',
    port: {
        web: {
            $filter: 'env',
            test: 9000,
            production: process.env.PORT,
            $default: 8000
        }
    },
    baseUrl: {
        $filter: 'env',
        $meta: 'values should not end in "/"',
        production: process.env.HOST_URL,
        $default: 'http://127.0.0.1:8000'
    },
    authAttempts: {
        forIp: 50,
        forIpAndUser: 7
    },
    cookieSecret: {
        $filter: 'env',
        production: process.env.COOKIE_SECRET,
        $default: '!k3yb04rdK4tz~4qu4~k3yb04rdd0gz!'
    },
    hapiMongoModels: {
        mongodb: {
            uri: {
                $filter: 'env',
                production: process.env.MONGODB_URI,
                development: process.env.MONGODB_URI,
                test: 'mongodb://legablyqa:RXd8Nh3jtg46bnEXd8Nh3j@legablystage.kiwitechopensource.com:21000/Legably_staging',
                $default: process.env.MONGODB_URI
            }
        },
        autoIndex: true
    },
    nodemailer: {
        host: process.env.SMTP_MAIL_HOST,
        port: process.env.SMTP_MAIL_PORT,
        secure: process.env.SMTP_MAIL_ISSECURE,
        auth: {
            user: process.env.SMTP_MAIL_USER,
            pass: process.env.SMTP_MAIL_PASS
        }
    },
    system: {
        fromAddress: process.env.MAIL_FROM,
        toAddress: ''
    },
    s3BucketPath: {
        $filter: 'env',
        production: 'https://' + process.env.AWS_BUCKET + '.s3.amazonaws.com/',
        $default: 'https://legably-dev.s3.amazonaws.com/'
    },
    salt: {
        $filter: 'env',
        production: process.env.SALT,
        $default: 1
    }
};

const store = new Confidence.Store(config);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
