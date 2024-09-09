import Contest from '../models/contest.js';

export const createContest = async (req, res) => {
  try {
    const { name, description, created_by, problems } = req.body;

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
    res.status(500).json({ error: error.message });
  }
};
