import mongoose, {
  Schema,
} from 'mongoose';

const postModel = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: ['5', 'Must be at least 5 characters long.'],
  },
  text: {
    type: String,
    required: true,
    minlength: ['30', 'Must be at least 30 characters long.'],
  },
}, {
  timestamps: true,
});

export default mongoose.model('Posts', postModel);
