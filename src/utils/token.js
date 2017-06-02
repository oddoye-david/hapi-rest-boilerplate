import jwt from 'jsonwebtoken';
import constants from '../config/constants';

export const decodeToken = token => new Promise((resolve, reject) => {
  jwt.verify(token, constants.JWT_SECRET, (err, decoded) => {
    if (err) {
      return reject(err);
    }
    return resolve(decoded);
  });
});
