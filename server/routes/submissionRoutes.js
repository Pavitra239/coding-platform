import express from 'express';
import Submission from '../models/submission.js';
import { isAuthorized } from '../middlewares/auth.js';
const router = express.Router();
router.use(isAuthorized);

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
      testCaseResults,
      numberOfTestCase,
      numberOfTestCasePass // Added to capture the test case results from the body
    } = req.body;

    if (!testCaseResults || !Array.isArray(testCaseResults)) {
      return res.status(400).json({ message: 'Test case results are required and must be an array.' });
    }

    const submission = new Submission({
      user_id,
      problem_id,
      code,
      language,
      status,
      execution_time,
      memory_usage,
      testCaseResults,
      numberOfTestCase,
      numberOfTestCasePass // Save the test case results as part of the submission
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



// Route to get all submissions
router.get('/problem', async (req, res) => {
  const { problem_id } = req.query;

  console.log(problem_id);
  console.log("hello123")

  try {
    // Find submissions by problem_id and populate user and problem data
    const submissions = await Submission.find({ problem_id })
      .populate('user_id', 'batch branch id semester username _id') // Populate all fields of the user
      .populate('problem_id', 'title description'); // Populate only title and description of the problem

    // If no submissions found, return a 404
    if (submissions.length === 0) {
      return res.status(404).json({ message: 'No submissions found for the given problem ID.' });
    }

    res.status(200).json({
      message: 'Submissions retrieved successfully',
      submissions,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});


// Route to get all submissions for specific user
router.get('/user/submissions', async (req, res) => {
  const { user_id, page = 1, limit = 10 } = req.query;

  console.log(`User ID: ${user_id}, Page: ${page}, Limit: ${limit}`);

  try {
    console.log("hello")
    const submissions = await Submission.find({ user_id })
      .populate('problem_id', 'title description') // Populate only title and description of the problem
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
      .skip((page - 1) * limit) // Skip records for pagination
      .limit(parseInt(limit)); // Limit the number of records

    console.log(submissions)

    const totalSubmissions = await Submission.countDocuments({ user_id }); // Count total submissions

    if (submissions.length === 0) {
      console.log("hello2")
      return res.status(404).json({ message: 'No submissions found for the given user ID.' });
    }

    console.log("hello3")
    res.status(200).json({
      message: 'Submissions retrieved successfully',
      submissions,
      totalSubmissions,
      totalPages: Math.ceil(totalSubmissions / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});


export default router;
