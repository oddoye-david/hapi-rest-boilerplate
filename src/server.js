'use strict';

/*
  Imports
*/
import Hapi from 'hapi';
import Inert from 'inert';
import Vision from 'vision';
import HapiSwagger from 'hapi-swagger';
import Boom from 'boom';
import mongoose from 'mongoose';
import glob from 'glob';
import path from 'path';
import chroma from '@v3rse/chroma';

import constants from './config/constants';
import {
  decodeToken,
} from './utils/token';

/* Initialise Server*/
const server = new Hapi.Server();

// The connection object takes some
// configuration, including the port
server.connection({
  port: constants.PORT,
  routes: {
    cors: {
      origin: ['*'],
      headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Merchant'],
    },
  },
});

/**
 * Decode JWT on every request, before the handler function runs
 */
server.ext('onPreHandler', (req, res) => {
  if (req.headers.authorization) {
    const jwt = req.headers.authorization.replace('Bearer ', '');
    decodeToken(jwt)
      .then((err, decoded) => {
        if (err) {
          throw Boom.badRequest(err);
        }
        req.pre.userScope = decoded.scope;
        req.pre.userId = decoded.id;
        res.continue();
      });
  } else {
    res.continue();
  }
});


/* Swagger Options*/
const swaggerOptions = {
  info: {
    title: 'myPayutil API Documentation',
    version: '3.0.0',
    contact: {
      name: 'David Oddoye',
      email: 'david@integratorsb2b.com',
    },
  },
  securityDefinitions: {
    jwt: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
    },
  },
  security: [{
    jwt: [],
  }],
  auth: false,
  basePath: '/api',
  pathPrefixSize: 2,
  host: process.env.API_HOST,
};

/**
 * Register Swagger Plugin
 */
server.register([
  Inert,
  Vision, {
    register: HapiSwagger,
    options: swaggerOptions,
  },
], (err) => {
  if (err) {
    throw err;
  }
});


/**
 * @param {any} decoded
 * @param {any} request
 * @param {any} callback
 * @returns
 */
// TODO: Verify user with ID exists
const validate = (decoded, request, callback) => {
  if (decoded) {
    return callback(null, true);
  }
  return callback({
    error: 'Validation Err',
  }, false);
};

/**
 * Register JWT plugin
 */
server.register(require('hapi-auth-jwt2'), () => {
  // We are giving the strategy a name of 'jwt'
  server.auth.strategy('jwt', 'jwt', false, {
    key: constants.JWT_SECRET,
    validateFunc: validate,
    verifyOptions: {
      algorithms: ['HS256'],
    },
    tokenType: 'Bearer',
  });

  const plugins = [];
  // Look through the routes in
  // all the subdirectories of API
  // and create a new route for each
  glob.sync('modules/**/*.routes.js', {
    cwd: __dirname,
  }).forEach((file) => {
    // const route = require(path.join(__dirname, file)); // eslint-disable-line
    // server.route(route);

    const routePluginPath = path.join(__dirname, file);
    plugins.push(require(`${routePluginPath}`)); // eslint-disable-line
  });

  // Load plugins and start server
  server.register(plugins, (routesErr) => {
    if (routesErr) {
      throw routesErr;
    }


    // Start the server
    server.start((serverStartErr) => {
      if (serverStartErr) {
        throw serverStartErr;
      }

      mongoose.Promise = global.Promise;
      // Once started, connect to Mongo through Mongoose
      mongoose.connect(constants.MONGO_URL, {}, (mongooseErr) => {
        if (mongooseErr) {
          throw mongooseErr;
        }

        console.log(chroma.bold.green(`
      ==================================================
      Server running on ${constants.API_HOST}
      ==================================================
      `));
      });
    });
  });
});
