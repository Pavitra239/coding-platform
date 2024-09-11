import Problem from '../models/problem.js';

// Create problem
export const createProblem = async (req, res) => {
  const { title, description, difficulty, inputFormat, outputFormat, sampleIO, constraints, tags, createdBy } = req.body;
  console.log(req.body);

  try {
    const problem = new Problem({
      title,
      description,
      difficulty,
      inputFormat,
      outputFormat,
      sampleIO, // Expecting an array of {input, output} pairs
      constraints,
      tags,
      createdBy: req.user?._id || createdBy, // Use req.user._id if available, otherwise fall back to req.body.createdBy for testing
    });

    const createdProblem = await problem.save();
    res.status(201).json(createdProblem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProblems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch problems with pagination and sorting by creation time (newest first)
    const problems = await Problem.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalProblems = await Problem.countDocuments();

    res.json({
      problems,
      currentPage: page,
      totalPages: Math.ceil(totalProblems / limit),
      totalProblems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get problem by ID
export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update problem
export const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const updates = req.body;

    // If samples are provided, ensure they are correctly formatted as an array of objects
    if (updates.sampleIO) {
      problem.sampleIO = updates.sampleIO.map(sample => ({
        input: sample.input,
        output: sample.output,
      }));
    }

    // Update the rest of the fields
    Object.assign(problem, updates);
    
    const updatedProblem = await problem.save();

    res.json(updatedProblem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete problem
export const deleteProblem = async (req, res) => {
    try {
      const problem = await Problem.findById(req.params.id);
  
      if (!problem) {
        return res.status(404).json({ message: 'Problem not found' });
      }
  
      await Problem.deleteOne({ _id: req.params.id }); // Use deleteOne instead of remove
      res.json({ message: 'Problem removed' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};