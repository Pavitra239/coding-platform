import express from 'express';
import Submission from '../models/submission.js';

const router = express.Router();

// Route to create a new submission
router.post('/', async (req, res) => {
  try {
    const { user_id, problem_id, code,status, language, execution_time, memory_usage } = req.body;

    const submission = new Submission({
      user_id,
      problem_id,
      code,
      language,
      execution_time,
      memory_usage,
      status
    });
    console.log(req.body);
    await submission.save();
    res.status(201).json({
      message: 'Submission created successfully',
      submission,
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
    const submissions = await Submission.find({ user_id, problem_id })
      .populate('user_id', 'name')
      .populate('problem_id', 'title');
      
    res.status(200).json(submissions);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
