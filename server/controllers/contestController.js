import Contest from '../models/contest.js';

export const createContest = async (req, res) => {
  try {
    const { name, description, created_by, problems } = req.body;
    console.log(req.body);

    if (!name || !description || !created_by) {
      return res.status(400).json({ error: 'Name, description, and creator are required' });
    }

    const newContest = new Contest({
      name,
      description,
      created_by,
      problems,
    });

    await newContest.save();
    res.status(201).json(newContest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const getContestById = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  
  try {
    const contest = await Contest.findById(id).populate('created_by').populate('problems');
    
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    console.log(contest);
    res.status(200).json(contest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateContest = async (req, res) => {
  const { id } = req.params;
  const { name, description, created_by, problems } = req.body;

  try {
    const updatedContest = await Contest.findByIdAndUpdate(
      id,
      { name, description, created_by, problems },
      { new: true, runValidators: true }
    );

    if (!updatedContest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    res.status(200).json(updatedContest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteContest = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedContest = await Contest.findByIdAndDelete(id);

    if (!deletedContest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    res.status(204).send(); // No content
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Get all contests
export const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate('created_by')  // Populate created_by field
      .populate('problems');    // Populate problems field

    res.status(200).json(contests);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

