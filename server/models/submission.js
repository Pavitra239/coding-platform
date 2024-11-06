import mongoose from 'mongoose';
import { STATUS } from '../utils/constants.js';
const { Schema } = mongoose;

const submissionSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'user id is required'],
  },
  problem_id: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: [true, 'problem id is required'],
  },
  code: {
    type: String,
    required: [true, 'code is required'],
  },
  language: {
    type: String,
    required: [true, 'language is required'],
  },
  status: {
    type: String,
    enum: Object.values(STATUS),
    default: STATUS.PENDING,
    required: [true, 'status is required'],
  },
  execution_time: {
    type: Number,
    required: [true, 'execution time is required'],
  },
  memory_usage: {
    type: Number,
    required: [true, 'memory usage is required'],
  },
}, {
  timestamps: true
});

export default mongoose.model('Submission', submissionSchema);
