import mongoose from 'mongoose';
import { DIFFICULTY } from '../utils/constants.js'; // Ensure this path is correct
const { Schema } = mongoose;

const problemSchema = new Schema({
  title: { type: String, required: [true, 'Title is required'] },
  description: { type: String, required: [true, 'Description is required'] },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: Object.values(DIFFICULTY),
    default: DIFFICULTY.EASY,
  },
  inputFormat: { type: String, required: [true, 'Input format is required'] },
  outputFormat: { type: String, required: [true, 'Output format is required'] },
  sample_input: { type: String, required: [true, 'Sample input is required'] },
  sample_output: { type: String, required: [true, 'Sample output is required'] },
  constraints: { type: String },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
  },
  tags: [{ type: String }],
  score: { type: Number },
}, {
  timestamps: true
});

export default mongoose.model('Problem', problemSchema);
