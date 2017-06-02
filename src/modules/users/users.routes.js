import Joi from 'joi';

import * as UserController from './users.controller';

Joi.objectId = require('joi-objectid')(Joi);

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/api/users',
    config: {
      description: 'Get users',
      notes: 'Returns all users',
      tags: ['api', 'users'],
      handler: UserController.findAllUsers,
      auth: false,
    },
  });

  return next();
};

exports.register.attributes = {
  name: 'users',
};
