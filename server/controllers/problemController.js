import Problem from '../models/problem.js';

//create problem
export const createProblem = async (req, res) => {
    const { title, description, difficulty, inputFormat, outputFormat, sample_input, sample_output, constraints, tags, createdBy } = req.body;
  
    try {
      const problem = new Problem({
        title,
        description,
        difficulty,
        inputFormat,
        outputFormat,
        sample_input,
        sample_output,
        constraints,
        tags,
        createdBy: req.user?._id || createdBy // Use req.user._id if available, otherwise fall back to req.body.createdBy for testing
      });
  
      const createdProblem = await problem.save();
      res.status(201).json(createdProblem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  

//get problem
export const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find({});
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get problem by id
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

//update problem
export const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    Object.assign(problem, req.body); // Updates only fields sent in req.body
    const updatedProblem = await problem.save();

    res.json(updatedProblem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete problem
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
  
