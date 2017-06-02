import Boom from 'boom';

import Posts from './posts.model';

export const getAll = async (request, response) => {
  try {
    const posts = await Posts.find({});

    return response(posts);
  } catch (e) {
    return response(Boom.badRequest(e));
  }
};

export const getById = async (request, response) => {
  try {
    const post = await Posts.findById(request.params.id);

    if (!post) {
      return response(null).code(404);
    }

    return response(post);
  } catch (e) {
    return response(Boom.badRequest(e));
  }
};

export const create = async (request, response) => {
  try {
    const post = await Posts.create(request.payload);

    return response(post).code(201);
  } catch (e) {
    return response(Boom.badRequest(e));
  }
};
