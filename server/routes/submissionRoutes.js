import express from 'express';
import Submission from '../models/submission.js';

const router = express.Router();

// Route to create a new submission
router.post('/', async (req, res) => {
  try {
    // Destructure the body to extract relevant fields
    const { 
      user_id, 
      problem_id, 
      code, 
      status, 
      language, 
      execution_time, 
      memory_usage,
      testCaseResults // Added to capture the test case results from the body
    } = req.body;

    // Validate the presence of required fields
    if (!testCaseResults || !Array.isArray(testCaseResults)) {
      return res.status(400).json({ message: 'Test case results are required and must be an array.' });
    }

    // Create a new submission with the provided data
    const submission = new Submission({
      user_id,
      problem_id,
      code,
      language,
      status,
      execution_time,
      memory_usage,
      testCaseResults // Save the test case results as part of the submission
    });

    // Save the submission to the database
    console.log(req.body);  // Log the request body for debugging purposes
    await submission.save();

    res.status(201).json({
      message: 'Submission created successfully',
      submission, // Return the full submission object
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// Route to get submissions for a specific user and problem
router.get('/', async (req, res) => {
  const { user_id, problem_id } = req.query;

  try {
    // Find submissions by user_id and problem_id, and populate user and problem data
    const submissions = await Submission.find({ user_id, problem_id })
      .populate('user_id', 'name') // Populate user's name
      .populate('problem_id', 'title') // Populate problem's title

    // If no submissions found, return a 404
    if (submissions.length === 0) {
      return res.status(404).json({ message: 'No submissions found for the given user and problem.' });
    }

    res.status(200).json(submissions);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
