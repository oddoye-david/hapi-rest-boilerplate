import mongoose, {
  Schema,
} from 'mongoose';
import { hashSync, compareSync } from 'bcrypt';
import jwt from 'jsonwebtoken';

import constants from '../../config/constants';

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required!'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required!'],
    unique: true,
  },
  firstname: {
    type: String,
    required: [true, 'First name is required!'],
  },
  lastname: {
    type: String,
    required: [true, 'Last name is required!'],
  },
  password: {
    type: String,
    required: [true, 'Password is required!'],
    trim: true,
    minlength: [6, 'Password need to be longer!'],
    validate: {
      validator(password) {
        return passwordReg.test(password);
      },
      message: '{VALUE} is not a valid password!',
    },
  },
}, {
  timestamps: true,
});

UserSchema.plugin(uniqueValidator, {
  message: '{VALUE} already taken!',
});

UserSchema.pre('save', function (next) { // eslint-disable-line
  if (this.isModified('password')) {
    this.password = this._hashPassword(this.password);
  }

  return next();
});

UserSchema.methods = {
  _hashPassword(password) {
    return hashSync(password);
  },
  authenticateUser(password) {
    return compareSync(password, this.password);
  },
  createToken() {
    return jwt.sign(
      {
        _id: this._id,
      },
      constants.JWT_SECRET,
    );
  },
  toAuthJSON() {
    return {
      _id: this._id,
      userName: this.userName,
      token: `JWT ${this.createToken()}`,
    };
  },
  toJSON() {
    return {
      _id: this._id,
      userName: this.userName,
    };
  },
};

export default mongoose.model('Users', UserSchema);
