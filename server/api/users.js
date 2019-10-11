'use strict';
const AuthPlugin = require('../auth');
const Async = require('async');
const Boom = require('boom');
const EscapeRegExp = require('escape-string-regexp');
const Joi = require('joi');
const Config = require('../../config');
const Bcrypt = require('bcrypt');

const internals = {};

internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;
    const PracticeAreas = server.plugins['hapi-mongo-models'].PracticeAreas;
    const WorkLocations = server.plugins['hapi-mongo-models'].WorkLocations;
    const EmploymentTypes = server.plugins['hapi-mongo-models'].EmploymentTypes;
    const States = server.plugins['hapi-mongo-models'].States;
    const Skills = server.plugins['hapi-mongo-models'].Skills;
    const Degrees = server.plugins['hapi-mongo-models'].Degrees;
    const Categories = server.plugins['hapi-mongo-models'].Categories;
    const PostJobs = server.plugins['hapi-mongo-models'].PostJobs;
    const NegotiateTerms = server.plugins['hapi-mongo-models'].NegotiateTerms;
    const JobStatus = server.plugins['hapi-mongo-models'].JobStatus;

    server.route({
        method: 'GET',
        path: '/users',
        config: {
            auth: {
                strategy: 'session',
                scope: ['admin']
            },
            validate: {
                query: {
                    email: Joi.string().allow(''),
                    role: Joi.string().allow(''),
                    fields: Joi.string(),
                    sort: Joi.string().default('status'),
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1),
                    is_bar_id_valid: Joi.string().allow(''),
                    status: Joi.number()
                }
            },
            plugins: {
                crumb: false
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('admin')
            ]
        },
        handler: function (request, reply) {
            const query = {};
            const keys = Object.keys(request.query);
            if (request.query.email) {
                query.email = new RegExp('^.*?' + EscapeRegExp(request.query.email) + '.*$', 'i');
            }
            if (keys.indexOf('status') != -1 && request.query.status != 111) {
                query.status = request.query.status;
            }
            if (request.query.is_bar_id_valid) {
                query.is_bar_id_valid = request.query.is_bar_id_valid;
            }
            query.role = 'user';
            const fields = request.query.fields || 'email role _id first_name last_name status is_bar_id_valid freeze_activity';
            const sort = request.query.sort;
            const limit = request.query.limit;
            const page = request.query.page;
            User.pagedFind(query, fields, sort, limit, page, (err, results) => {

                if (err) {
                    return reply(err);
                }
                reply(results);
            });
        }
    });


    server.route({
        method: 'GET',
        path: '/users/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: ['admin']
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('admin')
            ]
        },
        handler: function (request, reply) {

            const fields = request.query.fields || {role:1, email:1, first_name:1, _id:1, last_name:1, status:1, is_bar_id_valid:1, freeze_activity:1};

            User.findById(request.params.id, fields, (err, user) => {

                if (err) {
                    return reply(err);
                }

                if (!user) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(user);
            });
        }
    });


    server.route({
        method: 'GET',
        path: '/users/my',
        config: {
            auth: {
                strategy: 'session',
                scope: ['admin']
            }
        },
        handler: function (request, reply) {

            const id = request.auth.credentials.user._id.toString();
            const fields = User.fieldsAdapter('email role');
            User.findById(id, fields, (err, user) => {
                if (err) {
                    return reply(err);
                }

                if (!user) {
                    return reply(Boom.notFound('Document not found. That is strange.'));
                }
                reply(user);
            });
        }
    });

    server.route({
        method: 'PUT',
        path: '/users/my/changePassword',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
            validate: {
                payload: {
                    password: Joi.string().required(),
                    passwordConfirm: Joi.string().required(),
                    oldPassword: Joi.string().required(),
                }
            },
            plugins: {
                crumb: false
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('admin'),
                {
                    assign: 'passwordHash',
                    method: function (request, reply) {

                        User.generatePasswordHash(request.payload.password, (err, hash) => {

                            if (err) {
                                return reply(err);
                            }
                            reply(hash);
                        });
                    }
                }
            ]
        },
        handler: function (request, reply) {
            const password = request.payload.password;
            const passwordConfirm = request.payload.passwordConfirm;
            if (User.passwordValidator(password) && User.passwordValidator(passwordConfirm)) {
                const oldPassword = request.auth.credentials.user.password;
                if(password !== passwordConfirm) {
                    return reply(Boom.conflict('New password format is not correct.'));
                }
                Bcrypt.compare(request.payload.oldPassword, oldPassword, function(err, result) {
                    if (result) {
                        const id = request.auth.credentials.user._id.toString();
                        const update = {
                            $set: {
                                password: request.pre.passwordHash.hash
                            }
                        };
                        User.findByIdAndUpdate(id, update, (err, user) => {
                            if (err) {
                                return reply(err);
                            }

                            reply(user);
                        });
                    } else {
                        return reply(Boom.conflict('Current password is not correct.'));
                    }
                });
            } else {
                reply(Boom.conflict('Invalid parameters.'));
            }
        }
    });


    server.route({
        method: 'GET',
        path: '/users/export',
        config: {
            auth: {
                strategy: 'session',
                scope: ['admin']
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('admin'),
                {
                    assign: 'degrees',
                    method: function (request, reply) {
                        let degrees = {};
                        Degrees.find({}, (err, data) => {
                            if (err) {
                                return reply(err);
                            }
                            data.forEach( degree => {
                                degrees[degree._id] = degree.name;
                            })
                           reply(degrees);
                        })
                    }
                },
                {
                    assign: 'practice_areas',
                    method: function (request, reply) {
                        let practiceAreas = {};
                        PracticeAreas.find({}, (err, data) => {
                            if (err) {
                                return reply(err);
                            }
                            data.forEach( practiceArea => {
                                practiceAreas[practiceArea._id] = practiceArea.name;
                            })
                           reply(practiceAreas);
                        })
                    }
                },
                {
                    assign: 'states',
                    method: function (request, reply) {
                        let states = {};
                        States.find({}, (err, data) => {
                            if (err) {
                                return reply(err);
                            }
                            data.forEach( state => {
                                states[state._id] = state.name;
                            })
                           reply(states);
                        })
                    }
                },
                {
                    assign: 'skills',
                    method: function (request, reply) {
                        let skills = {};
                        Skills.find({}, (err, data) => {
                            if (err) {
                                return reply(err);
                            }
                            data.forEach( skill => {
                                skills[skill._id] = skill.name;
                            })
                           reply(skills);
                        })
                    }
                },
                {
                    assign: 'categories',
                    method: function (request, reply) {
                        let categories = {};
                        Categories.find({}, (err, data) => {
                            if (err) {
                                return reply(err);
                            }
                            data.forEach( category => {
                                categories[category._id] = category.name;
                            })
                           reply(categories);
                        })
                    }
                },
                {
                    assign: 'employment_types',
                    method: function (request, reply) {
                        let employmentTypes = {};
                        EmploymentTypes.find({}, (err, data) => {
                            if (err) {
                                return reply(err);
                            }
                            data.forEach( type => {
                                employmentTypes[type._id] = type.name;
                            })
                           reply(employmentTypes);
                        })
                    }
                }

            ]
        },
        handler: function (request, reply) {

            const listData = request.pre;
            const queryObj = {'role': 'user' };
            User.find(queryObj, (err, res) => {
                if (err) {
                    return reply(err);
                }
                let finalResult = [], csvData = '';
                res.map( function(temp) {
                  let defaultVal = 'N';
                  let ratePrefix = '$';
                  let sepObj = { 'multiValSeperator': '; ',
                    'multiColSeperator': ' | ',
                    'multiColMultiValSeperator': ' @ ' };
                  let seekerColPrefix = 'Seeker - ';
                  let posterColPrefix = 'Poster - ';
                  let seekerInfo = temp['job_seeker_info'];
                  let seekerBasicProfile = seekerInfo['basic_profile'];
                  let seekerBasicInfo = seekerBasicProfile['basic_info'];
                  let seekerNetwork = seekerInfo['network'];
                  let seekerJobProfile = seekerInfo['job_profile'];
                  let posterBasicProfile = temp['job_posters_info']['basic_profile'];
                  let posterBasicInfo = posterBasicProfile['basic_info'];
                  let s3BucketPath = Config.get('/s3BucketPath');
                  let result = {
                    'First Name': temp['first_name'],
                    'Last Name': temp['last_name'],
                    'Email': temp['email'],
                    [seekerColPrefix + 'Street Address']: '"' + seekerBasicInfo['street_address'] + '"',
                    [seekerColPrefix + 'City']: '"' + seekerBasicInfo['city'] + '"',
                    [seekerColPrefix + 'State']: '"' + (seekerBasicInfo['state_id'] ? listData['states'][seekerBasicInfo['state_id'] || null] : '' ) + '"',
                    [seekerColPrefix + 'Zip Code']: '"' + seekerBasicInfo['zipcode'] + '"',
                    [seekerColPrefix + 'Phone Number']: '"' + seekerBasicInfo['phone_number'] + '"',
                    [seekerColPrefix + 'Education']: '',
                    [seekerColPrefix + 'State Licensure']: '',
                    [seekerColPrefix + 'Practice Areas']: '',
                    [seekerColPrefix + 'Skills']: '',
                    [seekerColPrefix + 'Other Skills']: '"' + (seekerBasicProfile['others'] || '') + '"',
                    [seekerColPrefix + 'Malpractice Insurance']: '"' + seekerBasicProfile['do_you_have_malpractice_insurance'] + '"',
                    [seekerColPrefix + 'Experience']: '',
                    [seekerColPrefix + 'Photo']: '"' + ( seekerNetwork['photo'] ? (s3BucketPath + seekerNetwork['photo']) : '' ) + '"',
                    [seekerColPrefix + 'Lawyer Headline']: '"' + seekerNetwork['lawyer_headline'] + '"',
                    [seekerColPrefix + 'About Lawyer']: '"' + seekerNetwork['about_lawyer'] + '"',
                    [seekerColPrefix + 'Linkedin Url']: '"' + seekerNetwork['linkedin_link'] + '"',
                    [seekerColPrefix + 'Resume Link']: '"' + ( seekerNetwork['resume'] ? (s3BucketPath + seekerNetwork['resume']) : '' ) + '"',
                    [seekerColPrefix + 'Writing Samples Link']: '',
                    [seekerColPrefix + 'Willing To Work Locally']: seekerJobProfile['willing_to_work_locally'] || defaultVal,
                    [seekerColPrefix + 'Work Location Locally']: '',
                    [seekerColPrefix + 'Willing To Work Remotely']: seekerJobProfile['willing_to_work_remotely'] || defaultVal,
                    [seekerColPrefix + 'Willing To Work Full Time']: seekerJobProfile['willing_to_work_full_time'] || defaultVal,
                    [seekerColPrefix + 'Willing To Work Part Time']: seekerJobProfile['willing_to_work_part_time'] || defaultVal,
                    [seekerColPrefix + 'Desired Job Type - Permanent']: '"' + defaultVal + '"',
                    [seekerColPrefix + 'Desired Job Min Amount - Permanent']: '"' + ratePrefix + 50000 + '"',
                    [seekerColPrefix + 'Desired Job Max Amount - Permanent']: '"' + ratePrefix + 200000 + '"',
                    [seekerColPrefix + 'Desired Job Type - Contract']: defaultVal,
                    [seekerColPrefix + 'Desired Job Min Amount - Contract']: '"' + ratePrefix + 0 + '"',
                    [seekerColPrefix + 'Desired Job Max Amount - Contract']: '"' + ratePrefix + 2000 + '"',
                    [posterColPrefix + 'Street Address']: '"' + posterBasicInfo['street_address'] + '"',
                    [posterColPrefix + 'City']: '"' + posterBasicInfo['city'] + '"',
                    [posterColPrefix + 'State']: '"' + (posterBasicInfo['state_id'] ? listData['states'][posterBasicInfo['state_id'] || null] : '') + '"',
                    [posterColPrefix + 'Zipcode']: '"' + posterBasicInfo['zipcode'] + '"',
                    [posterColPrefix + 'Phone Number']: '"' + posterBasicInfo['phone_number'] + '"',
                    [posterColPrefix + 'Firm Name']: '"' + ( posterBasicProfile['firm_name'] ? posterBasicProfile['firm_name'] : '' )+ '"',
                    [posterColPrefix + 'Firm Title']: '"' + ( posterBasicProfile['title'] ? posterBasicProfile['title'] : '' ) + '"',
                    [posterColPrefix + 'Practice Locations']: '',
                    [posterColPrefix + 'Practice Areas']: '',
                    [posterColPrefix + 'Interested In Hiring']: '',
                    [posterColPrefix + 'Website Url']: '"' + ( posterBasicProfile['website_url'] ? posterBasicProfile['website_url'] : '' ) + '"',
                    'Created At': '',
                    'Updated At': ''
                  };

                  let eduArr = [];
                  seekerBasicProfile['education'].forEach(function(item) {
                    let eduDetail = (item['school']) + sepObj.multiColSeperator + (listData['degrees'][item['degree_id'] || null] || '') + sepObj.multiColSeperator + (item['year']) + sepObj.multiColSeperator + (item['education_additional_information']);
                    eduArr.push(eduDetail)
                  });
                  result[seekerColPrefix + 'Education'] = '"' + eduArr.join(sepObj.multiColMultiValSeperator) + '"';

                  let barArr = [];
                  seekerBasicProfile['bar_admission'].forEach(function(item) {
                    let barDetail = (listData['states'][item['bar_state_id'] || null] || '') + sepObj.multiColSeperator + (item['bar_registration_number']);
                    barArr.push(barDetail);
                  });
                  result[seekerColPrefix + 'State Licensure'] = '"' + barArr.join(sepObj.multiColMultiValSeperator) + '"';

                  let pracAreaArr = [];
                  seekerBasicProfile['practice_area_id'].forEach(function(item) {
                    pracAreaArr.push(listData['practice_areas'][item || null] || '');
                  });
                  result[seekerColPrefix + 'Practice Areas'] = '"' + pracAreaArr.join(sepObj.multiValSeperator) + '"';

                  let skillArr = [];
                  seekerBasicProfile['skill_used_id'].forEach(function(item) {
                    skillArr.push(listData['skills'][item || null] || '');
                  });
                  result[seekerColPrefix + 'Skills'] = '"' + skillArr.join(sepObj.multiValSeperator) + '"';

                  let expArr = [];
                  seekerInfo['experience'].forEach(function(item) {
                    let empTypeArr = [], skillArr = [], dateArr = [];
                    item['employment_type_id'].forEach(function(empType) {
                      empTypeArr.push(listData['employment_types'][empType || null] || '');
                    });

                    item['skill_used_id'].forEach(function(skillUsed){
                      skillArr.push(listData['skills'][skillUsed || null] || '');
                    });

                    dateArr.push(item['start_date']);
                    item['start_date'] && !item['end_date'] ? dateArr.push('Present') : dateArr.push(item['end_date']);

                    let expDetail = (item['company_name']) + sepObj.multiColSeperator + (item['designation']) + sepObj.multiColSeperator + (item['present'] || defaultVal) + sepObj.multiColSeperator + (dateArr.join(sepObj.multiValSeperator)) + sepObj.multiColSeperator + (empTypeArr.join(sepObj.multiValSeperator)) + sepObj.multiColSeperator + (item['experience_additional_information']) + sepObj.multiColSeperator + (skillArr.join(sepObj.multiValSeperator)) + sepObj.multiColSeperator + (item['others'] || '');
                    expArr.push(expDetail);
                  });
                  result[seekerColPrefix + 'Experience'] = '"' + expArr.join(sepObj.multiColMultiValSeperator) + '"';

                  let samplesArr = [];
                  seekerNetwork['writing_samples'].forEach(function(item) {
                    item && samplesArr.push((s3BucketPath + item['path']));
                  });
                  result[seekerColPrefix + 'Writing Samples Link'] = '"' + samplesArr.join(sepObj.multiValSeperator) + '"';

                  let locArr = [];
                  seekerJobProfile['willing_to_work_location_id'].forEach(function(item) {
                    locArr.push(listData['states'][item || null] || '');
                  });
                  result[seekerColPrefix + 'Work Location Locally'] = '"' + locArr.join(sepObj.multiValSeperator) + '"';

                  seekerJobProfile['desired_job_type'].forEach(function(item) {
                    if (listData['employment_types'][item['employment_type_id']] === 'Permanent') {
                      result[seekerColPrefix + 'Desired Job Type - Permanent'] = item['selected'];
                      result[seekerColPrefix + 'Desired Job Min Amount - Permanent'] = '"' + ratePrefix + item['min_amount'] + '"';
                      result[seekerColPrefix + 'Desired Job Max Amount - Permanent'] = '"' + ratePrefix + item['max_amount'] + '"';
                    } else {
                      result[seekerColPrefix + 'Desired Job Type - Contract'] = item['selected'];
                      result[seekerColPrefix + 'Desired Job Min Amount - Contract'] = '"' + ratePrefix + item['min_amount'] + '"';
                      result[seekerColPrefix + 'Desired Job Max Amount - Contract'] = '"' + ratePrefix + item['max_amount'] + '"';
                    }
                  });

                  let pracLocArr = [];
                  posterBasicProfile['practice_location_id'].forEach(function(item) {
                    pracLocArr.push(listData['states'][item || null] || '');
                  });
                  result[posterColPrefix + 'Practice Locations'] = '"' + pracLocArr.join(sepObj.multiValSeperator)  + '"';

                  let pracArr = []
                  posterBasicProfile['practice_area_id'].forEach(function(item) {
                    pracArr.push(listData['practice_areas'][item]);
                  });
                  result[posterColPrefix + 'Practice Areas'] = '"' + pracArr.join(sepObj.multiValSeperator)  + '"';

                  let categArr = [];
                  posterBasicProfile['intrested_in_id'].forEach(function(item) {
                    categArr.push(listData['categories'][item || null] || '');
                  });
                  result[posterColPrefix + 'Interested In Hiring'] = '"' + categArr.join(sepObj.multiValSeperator)  + '"';

                    let createdAtInUtc = new Date(temp['created_at']).getTime();
                    let createdAtInEst = new Date(createdAtInUtc + (3600000 * -5));
                    result['Created At'] = ('0' + (createdAtInEst.getMonth() + 1)).slice(-2) + '/' + ('0' + createdAtInEst.getDate()).slice(-2) + '/' + createdAtInEst.getFullYear();

                    let updatedAtInUtc = new Date(temp['updated_at']).getTime();
                    let updatedAtInEst = new Date(updatedAtInUtc + (3600000 * -5));
                    result['Updated At'] = ('0' + (updatedAtInEst.getMonth() + 1)).slice(-2) + '/' + ('0' + updatedAtInEst.getDate()).slice(-2) + '/' + updatedAtInEst.getFullYear();

                  finalResult.push(result);
                  if (!csvData) {
                    csvData = Object.keys(result).join(',') + '\n';
                  }
                   csvData = csvData + Object.values(result).join(',') + '\n';
                });
                reply({data: csvData, key: "users"});

            })
        }

    });

    server.route({
        method: 'GET',
        path: '/users/postJobs',
        config: {
            auth: {
                strategy: 'session',
                scope: ['admin']
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('admin'),
               {
                    assign: 'work_locations',
                    method: function (request, reply) {
                        let workLocations = {};
                        WorkLocations.find({}, (err, data) => {
                            if (err) {
                                return reply(err);
                            }
                            data.forEach( location => {
                                workLocations[location._id] = location.name;
                            })
                           reply(workLocations);
                        })
                    }
                },
                {
                    assign: 'states',
                    method: function (request, reply) {
                        let states = {};
                        States.find({}, (err, data) => {
                            if (err) {
                                return reply(err);
                            }
                            data.forEach( state => {
                                states[state._id] = state.name;
                            })
                           reply(states);
                        })
                    }
                },
                {
                    assign: 'employment_types',
                    method: function (request, reply) {
                        let employmentTypes = {};
                        EmploymentTypes.find({}, (err, data) => {
                            if (err) {
                                return reply(err);
                            }
                            data.forEach( type => {
                                employmentTypes[type._id] = type.name;
                            })
                           reply(employmentTypes);
                        })
                    }
                },
                {
                    assign: 'users',
                    method: function (request, reply) {
                        let users = {};
                        const queryObj = { 'role': 'user' };
                        const fields = {email: 1};
                        User.find(queryObj, fields, (err, data) => {
                            if (err) {
                                return reply(err);
                            }
                            users.data = {};
                            data.forEach( user => {
                                users.data[user._id] = user.email;
                            })
                           reply(users);
                        })
                    }
                }
              ]
        },
        handler: function (request, reply) {
            const listData = request.pre, userData = request.pre.users.data;
            let csvData = '';
            let query = {};
            PostJobs.find(query, (err, res) => {
                if (err) {
                  return reply(err);
                }
                let finalResult = [];
                res.map(function(temp){
                    let ratePrefix = '$';
                    let sepObj = { 'multiValSeperator': '; ',
                      'multiColSeperator': ' | ',
                      'multiColMultiValSeperator': ' @ ' };
                    let result = {
                      'User Email': userData[temp['userId']],
                      'Job Headline': '"' + temp['jobHeadline'] + '"',
                      'Practice Areas': '',
                      'Skills Needed': '',
                      'Other Skills Needed': '"' + (temp['others'] || '') + '"',
                      'Job Description': '"' + temp['jobDescription'] + '"',
                      'City': '"' + temp['city'] + '"',
                      'State': '"' + (listData['states'][temp['state'] || null] || '') + '"',
                      'Zip Code': temp['zipCode'],
                      'Location': listData['work_locations'][temp['setting_id'] || null] || '',
                      'Estimated Start Date': temp['estimatedStartDate'] || 'ASAP',
                      'Estimated Duration - Amount': '"' + temp['duration'] + '"',
                      'Estimated Duration - Days': temp['durationPeriod'] === 'days' ? 'Y' : 'N',
                      'Estimated Duration - Weeks': temp['durationPeriod'] === 'weeks' ? 'Y' : 'N',
                      'Estimated Duration - Months': temp['durationPeriod'] === 'months' ? 'Y' : 'N',
                      'Target Rate - Amount': '"' + ratePrefix + temp['rate'] + '"',
                      'Target Rate - Hourly': temp['rateType'] === 'HOURLY' ? 'Y' : 'N',
                      'Target Rate - Fixed': temp['rateType'] === 'FIXED' ? 'Y' : 'N',
                      'Estimated Hours - Amount': temp['hours'],
                      'Estimated Hours - Part-Time': listData['employment_types'][temp['hoursType']] === 'Part-time' ? 'Y' : 'N',
                      'Estimated Hours - Full-Time': listData['employment_types'][temp['hoursType']] === 'Full-time' ? 'Y' : 'N',
                      'Amount Payable': '"' + ratePrefix + temp['subTotal'] + '"',
                      'Payment And Deliverable Schedule': '',
                      'Service Charge': '"' + (ratePrefix + Number(temp['total'] - temp['subTotal']).toFixed(2)) + '"',
                      'Estimated Total Cost': '"' + (ratePrefix + temp['total']) + '"',
                      'Created At': '',
                      'Updated At': ''
                    };

                    let pracArr = []
                    temp['practiceArea'].forEach(function(item) {
                      pracArr.push(item.label);
                    });
                    result['Practice Areas'] = '"' + pracArr.join(sepObj.multiValSeperator) + '"';

                    let skillArr = [];
                    temp['skillsNeeded'].forEach(function(item) {
                      skillArr.push(item.label);
                    });
                    result['Skills Needed'] = '"' + skillArr.join(sepObj.multiValSeperator) + '"';

                    let paymentArr = [];
                    temp['paymentDetails'].forEach(function(item) {
                      let paymentDetail = (item['rate'] ? ratePrefix + item['rate'] : '') + sepObj.multiColSeperator + (item['delivery']) || ''
                       + sepObj.multiColSeperator + item['dueDate'] || '';
                      paymentArr.push(paymentDetail);
                    });
                    result['Payment And Deliverable Schedule'] = '"' + paymentArr.join(sepObj.multiColMultiValSeperator) + '"';

                    let createdAtInUtc = new Date(temp['created_at']).getTime();
                    let createdAtInEst = new Date(createdAtInUtc + (3600000 * -5));
                    result['Created At'] = ('0' + (createdAtInEst.getMonth() + 1)).slice(-2) + '/' + ('0' + createdAtInEst.getDate()).slice(-2) + '/' + createdAtInEst.getFullYear();

                    let updatedAtInUtc = new Date(temp['updated_at']).getTime();
                    let updatedAtInEst = new Date(updatedAtInUtc + (3600000 * -5));
                    result['Updated At'] = ('0' + (updatedAtInEst.getMonth() + 1)).slice(-2) + '/' + ('0' + updatedAtInEst.getDate()).slice(-2) + '/' + updatedAtInEst.getFullYear();

                    finalResult.push(result);
                    if (!csvData) {
                      csvData = Object.keys(result).join(',') + '\n';
                    }
                    csvData = csvData + Object.values(result).join(',') + '\n';
                })
                reply({data: csvData, key: "jobs"});
            })

           // })

        }

    })

    // server.route({
    //     method: 'POST',
    //     path: '/users',
    //     config: {
    //         auth: {
    //             strategy: 'session',
    //             scope: 'admin'
    //         },
    //         validate: {
    //             payload: {
    //                 username: Joi.string().token().lowercase().required(),
    //                 email: Joi.string().email().lowercase().required(),
    //                 password: Joi.string().required()
    //             }
    //         },
    //         pre: [
    //             AuthPlugin.preware.ensureAdminGroup('root'),
    //             {
    //                 assign: 'usernameCheck',
    //                 method: function (request, reply) {

    //                     const conditions = {
    //                         username: request.payload.username
    //                     };

    //                     User.findOne(conditions, (err, user) => {

    //                         if (err) {
    //                             return reply(err);
    //                         }

    //                         if (user) {
    //                             return reply(Boom.conflict('Username already in use.'));
    //                         }

    //                         reply(true);
    //                     });
    //                 }
    //             }, {
    //                 assign: 'emailCheck',
    //                 method: function (request, reply) {

    //                     const conditions = {
    //                         email: request.payload.email
    //                     };

    //                     User.findOne(conditions, (err, user) => {

    //                         if (err) {
    //                             return reply(err);
    //                         }

    //                         if (user) {
    //                             return reply(Boom.conflict('Email already in use.'));
    //                         }

    //                         reply(true);
    //                     });
    //                 }
    //             }
    //         ]
    //     },
    //     handler: function (request, reply) {

    //         const username = request.payload.username;
    //         const password = request.payload.password;
    //         const email = request.payload.email;

    //         User.create(username, password, email, (err, user) => {

    //             if (err) {
    //                 return reply(err);
    //             }

    //             reply(user);
    //         });
    //     }
    // });


    server.route({
        method: 'PUT',
        path: '/users/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: ['admin']
            },
            validate: {
                payload: {
                    status: Joi.number(),
                    is_bar_id_valid: Joi.string(),
                    email: Joi.string().required(),
                    freeze_activity: Joi.boolean(),
                    prev_is_bar_id_valid: Joi.string()
                }
            },
            plugins: {
                crumb: false
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('admin'),
                {
                    assign: 'emailCheck',
                    method: function (request, reply) {

                        const conditions = {
                            email: request.payload.email,
                            _id: { $ne: User._idClass(request.params.id) }
                        };

                        User.findOne(conditions, (err, user) => {

                            if (err) {
                                return reply(err);
                            }

                            if (user) {
                                return reply(Boom.conflict('Email already in use.'));
                            }

                            reply(true);
                        });
                    }
                }
            ]
        },
        handler: function (request, reply) {

            const mailer = request.server.plugins.mailer;
            const id = request.params.id;
            const prev_is_bar_id_valid = request.payload.prev_is_bar_id_valid;
            const is_bar_id_valid = request.payload.is_bar_id_valid;
            const freeze_activity = request.payload.freeze_activity;
            let data = {};
            if (request.payload.hasOwnProperty('status')) {
                data.status = request.payload.status;
            }
            if (request.payload.hasOwnProperty('freeze_activity')) {
                data.freeze_activity = request.payload.freeze_activity;
            }
            if (request.payload.is_bar_id_valid) {
                data.is_bar_id_valid = request.payload.is_bar_id_valid;
                if (request.payload.is_bar_id_valid === 'Yes') {
                    data.freeze_activity = false;
                }
            }
            
            delete data.prev_is_bar_id_valid;
            const update = { $set: data };

            const filterById = {
                '_id': id
            };

            Async.auto({
                user: function (done) {
                    const fields = {role:1, email:1, first_name:1, _id:1, last_name:1, status:1, is_bar_id_valid:1};

                    User.findByIdAndUpdate(id, update, {new: true}, fields, done);
                },
                sendEmail: ['user', function(results, done) {
                    if (data.hasOwnProperty('freeze_activity')) {
                        let mailObj = {};
                        data.firstName = results.user.first_name;
                        data.hostPath = Config.get('/baseUrl');
                        data.imgPath = Config.get('/baseUrl') + '/public/media/logo-white@2x.png';

                        if (data.freeze_activity) {
                            data.subject = 'Account Frozen | Legably Message Center';
                            data.p1 = `Your account has been temporarily frozen because there is a problem with the Bar ID information that you entered on your profile.`;
                            data.p2 = `While your account is frozen you will not be able to apply to any new jobs or proceed with any existing job interviews.`;
                            data.p3 = `Please make sure the Bar ID information on your profile is correct and contact the Legably Support team at [support@legably.com].`;
                        } else {
                            data.subject = 'Account Unfrozen | Legably Message Center';
                            data.p1 = `Your account has been unfrozen. Thank you for working with us to proactively resolve this issue.`;
                            data.p2 = `You will now be able to apply to new jobs and proceed with any existing job interviews.`;
                            data.p3 = `If you have any additional questions please contact the Legably Support team at [support@legably.com].`;
                        }
                        const emailOptions = {
                            subject: data.subject,
                            to: {
                                name: results.user.first_name,
                                address: request.payload.email
                            }
                        };
                        const template = 'activity';
                        if(is_bar_id_valid != prev_is_bar_id_valid) {
                          mailer.sendEmail(emailOptions, template, data, done);
                        } else {
                            if(freeze_activity) {
                                mailer.sendEmail(emailOptions, template, data, done);
                            } else {
                                done(null, results);
                            }
                        }
                    }
                    else {
                        done(null, results);
                    }
                }]

            }, (err, results) => {

                if (!results.user) {
                    return reply(Boom.notFound('Document not found.'));
                }
                let res = {
                    role: results.user.role,
                    email: results.user.email,
                    first_name: results.user.first_name,
                    last_name: results.user.last_name,
                    _id: results.user._id,
                    status: results.user.status,
                    is_bar_id_valid: results.user.is_bar_id_valid,
                    freeze_activity: results.user.freeze_activity
                }

                reply(res);
            });
        }
    });

   server.route({
        method: 'GET',
        path: '/users/my/getPostJobs',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
            validate: {
                query: {
                    limit: Joi.number(),
                    page: Joi.number()
                }
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('admin'),
                {
                    assign: 'work_locations',
                    method: function (request, reply) {
                        let workLocations = {};
                        WorkLocations.find({}, (err, data) => {
                            if (err) {
                                return reply(err);
                            }
                            data.forEach( location => {
                                workLocations[location._id] = location.name;
                            })
                           reply(workLocations);
                        })
                    }
                },
                {
                    assign: 'states',
                    method: function (request, reply) {
                        let states = {};
                        States.find({}, (err, data) => {
                            if (err) {
                                return reply(err);
                            }
                            data.forEach( state => {
                                states[state._id] = state.name;
                            })
                           reply(states);
                        })
                    }
                },
                {
                    assign: 'employment_types',
                    method: function (request, reply) {
                        let employmentTypes = {};
                        EmploymentTypes.find({}, (err, data) => {
                            if (err) {
                                return reply(err);
                            }
                            data.forEach( type => {
                                employmentTypes[type._id] = type.name;
                            })
                           reply(employmentTypes);
                        })
                    }
                },
                {
                    assign: 'users',
                    method: function (request, reply) {
                        let users = {};
                        const queryObj = { 'role': 'user' };
                        const fields = {email: 1};
                        User.find(queryObj, fields, (err, data) => {
                            if (err) {
                                return reply(err);
                            }
                            users.data = {};
                            data.forEach( user => {
                                users.data[user._id] = user.email;
                            })
                           reply(users);
                        })
                    }
                },
                {
                    assign: 'postJobs',
                    method: function (request, reply) {
                        let query = {};
                        PostJobs.find(query, (err, res) => {
                            if (err) {
                              return reply(err);
                            } else {
                                reply(res.length);
                            }
                        });
                    }
                }
            ]
        },
        handler: function (request, reply) {
            const listData = request.pre, userData = request.pre.users.data;
            let csvData = '';
            let query = {};
            const limit = request.query.limit;
            const page = request.query.page;
            PostJobs.pagedFind(query, '', '', limit, page, (err, response) => {
                if (err) {
                  return reply(err);
                }
                let finalResult = [], res = response['data'];
                res.map(function(temp){
                    let ratePrefix = '$';
                    let sepObj = { 'multiValSeperator': '; ',
                      'multiColSeperator': ' | ',
                      'multiColMultiValSeperator': ' @ ' };
                    if (temp['estimatedStartDate']) {
                      temp['estimatedStartDate'] = temp['estimatedStartDate'].getDate()+'/' +
                      (temp['estimatedStartDate'].getMonth()+1) + '/'+temp['estimatedStartDate'].getFullYear();
                    }
                    let result = {
                      'User Email': userData[temp['userId']],
                      'Job Headline': '"' + temp['jobHeadline'] + '"',
                      'Practice Areas': '',
                      'Skills Needed': '',
                      'Other Skills Needed': '"' + (temp['others'] || '') + '"',
                      'Job Description': '"' + temp['jobDescription'] + '"',
                      'City': '"' + temp['city'] + '"',
                      'State': '"' + (listData['states'][temp['state'] || null] || '') + '"',
                      'Zip Code': temp['zipCode'],
                      'Location': listData['work_locations'][temp['setting_id'] || null] || '',
                      'Estimated Start Date': temp['estimatedStartDate'] || 'ASAP',
                      'Estimated Duration - Amount': '"' + temp['duration'] + '"',
                      'Estimated Duration - Days': temp['durationPeriod'] === 'days' ? 'Y' : 'N',
                      'Estimated Duration - Weeks': temp['durationPeriod'] === 'weeks' ? 'Y' : 'N',
                      'Estimated Duration - Months': temp['durationPeriod'] === 'months' ? 'Y' : 'N',
                      'Target Rate - Amount': '"' + ratePrefix + temp['rate'] + '"',
                      'Target Rate - Hourly': temp['rateType'] === 'HOURLY' ? 'Y' : 'N',
                      'Target Rate - Fixed': temp['rateType'] === 'FIXED' ? 'Y' : 'N',
                      'Estimated Hours - Amount': temp['hours'],
                      'Estimated Hours - Part-Time': listData['employment_types'][temp['hoursType']] === 'Part-time' ? 'Y' : 'N',
                      'Estimated Hours - Full-Time': listData['employment_types'][temp['hoursType']] === 'Full-time' ? 'Y' : 'N',
                      'Amount Payable': '"' + ratePrefix + temp['subTotal'] + '"',
                      'Payment And Deliverable Schedule': '',
                      'Service Charge': '"' + (ratePrefix + Number(temp['total'] - temp['subTotal']).toFixed(2)) + '"',
                      'Estimated Total Cost': '"' + (ratePrefix + temp['total']) + '"',
                      'Created At': temp['created_at'].getDate()+'/' + (temp['created_at'].getMonth()+1) + '/'+temp['created_at'].getFullYear(),
                      'Updated At': temp['updated_at'].getDate()+'/' + (temp['updated_at'].getMonth()+1) + '/'+temp['updated_at'].getFullYear(),
                      'Status': temp['status']
                    };

                    let pracArr = []
                    temp['practiceArea'].forEach(function(item) {
                      pracArr.push(item.label);
                    });
                    result['Practice Areas'] = '"' + pracArr.join(sepObj.multiValSeperator) + '"';

                    let skillArr = [];
                    temp['skillsNeeded'].forEach(function(item) {
                      skillArr.push(item.label);
                    });
                    result['Skills Needed'] = '"' + skillArr.join(sepObj.multiValSeperator) + '"';

                    let paymentArr = [];
                    temp['paymentDetails'].forEach(function(item) {
                      if (item['dueDate']) {
                        item['dueDate'] = item['dueDate'].getDate()+'/' + (item['dueDate'].getMonth()+1) + '/'+item['dueDate'].getFullYear()
                      }
                      let paymentDetail = (item['rate'] ? ratePrefix + item['rate'] : '') + sepObj.multiColSeperator + (item['delivery']) || ''
                       + sepObj.multiColSeperator + item['dueDate'] || '';
                      paymentArr.push(paymentDetail);
                    });
                    result['Payment And Deliverable Schedule'] = '"' + paymentArr.join(sepObj.multiColMultiValSeperator) + '"';
                    finalResult.push(result);
                })
                reply({data: finalResult, totalJobs: listData.postJobs});
            })
        }
    });


    // server.route({
    //     method: 'PUT',
    //     path: '/users/my',
    //     config: {
    //         auth: {
    //             strategy: 'session',
    //             scope: 'admin'
    //         },
    //         validate: {
    //             payload: {
    //                 username: Joi.string().token().lowercase().required(),
    //                 email: Joi.string().email().lowercase().required()
    //             }
    //         },
    //         pre: [
    //             AuthPlugin.preware.ensureNotRoot,
    //             {
    //                 assign: 'usernameCheck',
    //                 method: function (request, reply) {

    //                     const conditions = {
    //                         username: request.payload.username,
    //                         _id: { $ne: request.auth.credentials.user._id }
    //                     };

    //                     User.findOne(conditions, (err, user) => {

    //                         if (err) {
    //                             return reply(err);
    //                         }

    //                         if (user) {
    //                             return reply(Boom.conflict('Username already in use.'));
    //                         }

    //                         reply(true);
    //                     });
    //                 }
    //             }, {
    //                 assign: 'emailCheck',
    //                 method: function (request, reply) {

    //                     const conditions = {
    //                         email: request.payload.email,
    //                         _id: { $ne: request.auth.credentials.user._id }
    //                     };

    //                     User.findOne(conditions, (err, user) => {

    //                         if (err) {
    //                             return reply(err);
    //                         }

    //                         if (user) {
    //                             return reply(Boom.conflict('Email already in use.'));
    //                         }

    //                         reply(true);
    //                     });
    //                 }
    //             }
    //         ]
    //     },
    //     handler: function (request, reply) {

    //         const id = request.auth.credentials.user._id.toString();
    //         const update = {
    //             $set: {
    //                 username: request.payload.username,
    //                 email: request.payload.email
    //             }
    //         };
    //         const findOptions = {
    //             fields: User.fieldsAdapter('username email roles')
    //         };

    //         const filterById = {
    //             'user.id': id
    //         };

    //         const updateReference = {
    //             $set: {
    //                 'user.name': request.payload.username
    //             }
    //         };

    //         Async.auto({
    //             user: function (done) {

    //                 User.findByIdAndUpdate(id, update, findOptions, done);
    //             },
    //             account: function (done) {

    //                 Account.findOneAndUpdate(filterById, updateReference, done);
    //             },
    //             admin: function (done) {

    //                 Admin.findOneAndUpdate(filterById, updateReference, done);
    //             }
    //         }, (err, results) => {

    //             if (err) {
    //                 return reply(err);
    //             }

    //             reply(results.user);
    //         });
    //     }
    // });


    // server.route({
    //     method: 'PUT',
    //     path: '/users/{id}/password',
    //     config: {
    //         auth: {
    //             strategy: 'session',
    //             scope: 'admin'
    //         },
    //         validate: {
    //             params: {
    //                 id: Joi.string().invalid('000000000000000000000000')
    //             },
    //             payload: {
    //                 password: Joi.string().required()
    //             }
    //         },
    //         pre: [
    //             AuthPlugin.preware.ensureAdminGroup('root'),
    //             {
    //                 assign: 'password',
    //                 method: function (request, reply) {

    //                     User.generatePasswordHash(request.payload.password, (err, hash) => {

    //                         if (err) {
    //                             return reply(err);
    //                         }

    //                         reply(hash);
    //                     });
    //                 }
    //             }
    //         ]
    //     },
    //     handler: function (request, reply) {

    //         const id = request.params.id;
    //         const update = {
    //             $set: {
    //                 password: request.pre.password.hash
    //             }
    //         };

    //         User.findByIdAndUpdate(id, update, (err, user) => {

    //             if (err) {
    //                 return reply(err);
    //             }

    //             reply(user);
    //         });
    //     }
    // });


    // server.route({
    //     method: 'PUT',
    //     path: '/users/my/password',
    //     config: {
    //         auth: {
    //             strategy: 'session',
    //             scope: 'admin'
    //         },
    //         validate: {
    //             payload: {
    //                 password: Joi.string().required()
    //             }
    //         },
    //         pre: [
    //             AuthPlugin.preware.ensureNotRoot,
    //             {
    //                 assign: 'password',
    //                 method: function (request, reply) {

    //                     User.generatePasswordHash(request.payload.password, (err, hash) => {

    //                         if (err) {
    //                             return reply(err);
    //                         }

    //                         reply(hash);
    //                     });
    //                 }
    //             }
    //         ]
    //     },
    //     handler: function (request, reply) {

    //         const id = request.auth.credentials.user._id.toString();
    //         const update = {
    //             $set: {
    //                 password: request.pre.password.hash
    //             }
    //         };
    //         const findOptions = {
    //             fields: User.fieldsAdapter('username email')
    //         };

    //         User.findByIdAndUpdate(id, update, findOptions, (err, user) => {

    //             if (err) {
    //                 return reply(err);
    //             }

    //             reply(user);
    //         });
    //     }
    // });


    // server.route({
    //     method: 'DELETE',
    //     path: '/users/{id}',
    //     config: {
    //         auth: {
    //             strategy: 'session',
    //             scope: 'admin'
    //         },
    //         validate: {
    //             params: {
    //                 id: Joi.string().invalid('000000000000000000000000')
    //             }
    //         },
    //         pre: [
    //             AuthPlugin.preware.ensureAdminGroup('root')
    //         ]
    //     },
    //     handler: function (request, reply) {

    //         User.findByIdAndDelete(request.params.id, (err, user) => {

    //             if (err) {
    //                 return reply(err);
    //             }

    //             if (!user) {
    //                 return reply(Boom.notFound('Document not found.'));
    //             }

    //             reply({ success: true });
    //         });
    //     }
    // });


    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth', 'mailer', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'users'
};
