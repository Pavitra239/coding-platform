import mongoose from 'mongoose';
import { STATUS } from '../utils/constants.js';  // Ensure this path is correct
const { Schema } = mongoose;

// Define the structure for inputs, expected outputs, and test case results
const inputSchema = new mongoose.Schema({
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // Mixed types for inputs
  type: { type: String, required: true }, // For input types (e.g., "int")
  _id: { type: mongoose.Schema.Types.ObjectId, required: true }, // Assuming _id is passed in the input data
});

const outputSchema = new mongoose.Schema({
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // Mixed types for outputs
  type: { type: String, required: true }, // For output types (e.g., "int")
  _id: { type: mongoose.Schema.Types.ObjectId, required: true }, // Assuming _id is passed in the output data
});

const testCaseResultSchema = new Schema({
  inputs: { type: [inputSchema], required: true }, // Array of inputs for the test case
  expectedOutputs: { type: [outputSchema], required: true }, // Expected outputs for the test case
  output: { type: [String], required: true }, // Actual output (array of strings, as shown in your example)
  passed: { type: Boolean, required: true }, // Pass or fail status
  time: { type: Number, required: true }, // Execution time (in milliseconds or another unit)
  memory: { type: Number, required: true }, // Memory usage (in MB or another unit)
});

// Main submission schema
const submissionSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  problem_id: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: [true, 'Problem ID is required'],
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
  },
  status: {
    type: String,
    enum: Object.values(STATUS),
    default: STATUS.PENDING,
    required: [true, 'Status is required'],
  },
  execution_time: {
    type: Number,
    required: [true, 'Execution time is required'],
  },
  memory_usage: {
    type: Number,
    required: [true, 'Memory usage is required'],
  },
  numberOfTestCase: {
    type: Number,
    required: [true, 'numberOfTestCase is required'],
  },
  numberOfTestCasePass: {
    type: Number,
    required: [true, 'numberOfTestCasePass is required'],
  },
  testCaseResults: [testCaseResultSchema], // Array to store multiple test case results
}, {
  timestamps: true,
});

export default mongoose.model('Submission', submissionSchema);
