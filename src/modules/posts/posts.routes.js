import Joi from 'joi';

import * as PostController from './posts.controller';
import * as PostValidators from './posts.validators';

Joi.objectId = require('joi-objectid')(Joi);

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/api/posts',
    config: {
      description: 'Get posts',
      notes: 'Returns all posts',
      tags: ['api', 'posts'],
      handler: PostController.getAll,
      auth: false,
    },
  });

  server.route({
    method: 'GET',
    path: '/api/posts/{id}',
    config: {
      description: 'Get a post',
      notes: 'Returns post specified by id',
      tags: ['api', 'posts'],
      handler: PostController.getById,
      auth: false,
      validate: {
        params: {
          id: Joi.objectId().required(),
        },
      },
    },
  });

  server.route({
    method: 'POST',
    path: '/api/posts',
    config: {
      description: 'Create a post',
      notes: 'Creates a post',
      tags: ['api', 'posts'],
      handler: PostController.create,
      auth: false,
      validate: {
        payload: PostValidators.createPost,
      },
    },
  });

  return next();
};

exports.register.attributes = {
  name: 'posts',
};
