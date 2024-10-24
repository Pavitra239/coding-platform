import mongoose from 'mongoose';
import { DIFFICULTY } from '../utils/constants.js'; // Ensure this path is correct

const { Schema } = mongoose;

const sampleSchema = new Schema({
  input: { type: String, required: [true, 'Sample input is required'] },
  output: { type: String, required: [true, 'Sample output is required'] }
});

const inputSchema = new mongoose.Schema({
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // Assuming mixed types for inputs
  type: { type: String, required: true }, // For input types
});

const outputSchema = new mongoose.Schema({
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // Assuming mixed types for outputs
  type: { type: String, required: true }, // For output types
});

const testCaseSchema = new Schema({
  inputs: { type: [inputSchema], required: true }, // Array of inputs
  outputs: { type: [outputSchema], required: true }, // Array of outputs
});

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
  sampleIO: [sampleSchema], // Array of sample input/output pairs
  testCases: [testCaseSchema], // Array of actual test cases for evaluation
  constraints: { type: String },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
  },
  tags: [{ type: String }], // Array of tags
  score: { type: Number, default: 0 }, // Score field
}, {
  timestamps: true
});

export default mongoose.model('Problem', problemSchema);