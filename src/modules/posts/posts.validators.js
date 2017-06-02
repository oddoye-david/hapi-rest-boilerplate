import Joi from 'joi';

export const createPost = {
  title: Joi.string().required(),
  text: Joi.string().required(),
};
