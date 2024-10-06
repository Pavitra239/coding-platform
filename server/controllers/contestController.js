import Contest from '../models/contest.js';

// Function to determine contest status based on current time
const determineStatus = (start_time, end_time) => {
  const now = new Date();
  if (now < start_time) {
    return 'upcoming';  // Contest has not started yet
  } else if (now >= start_time && now <= end_time) {
    return 'ongoing';   // Contest is currently live
  } else {
    return 'completed'; // Contest has ended
  }
};

// Create a new contest
export const createContest = async (req, res) => {
  try {
    const { name, description, created_by, problems, start_time, end_time } = req.body;

    // Validate required fields
    if (!name || !description || !created_by || !start_time || !end_time) {
      return res.status(400).json({ error: 'Name, description, creator, start time, and end time are required' });
    }

    // Convert to Date objects
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);

    // Validate date-time values
    if (isNaN(startTime) || isNaN(endTime)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ error: 'Start time must be before end time' });
    }

    // Determine contest status
    const status = determineStatus(startTime, endTime);

    // Create a new contest instance
    const newContest = new Contest({
      name,
      description,
      created_by,
      problems,
      start_time: startTime,
      end_time: endTime,
      status,
    });

    console.log(newContest);

    // Save the contest to the database
    await newContest.save();
    res.status(201).json(newContest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Update a contest
export const updateContest = async (req, res) => {
  const { id } = req.params;
  const { name, description, created_by, problems, start_time, end_time } = req.body;

  try {
    // Convert to Date objects
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);

    // Validate date-time values
    if (isNaN(startTime) || isNaN(endTime)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ error: 'Start time must be before end time' });
    }

    // Determine contest status
    const status = determineStatus(startTime, endTime);

    const updatedContest = await Contest.findByIdAndUpdate(
      id,
      {
        name,
        description,
        created_by,
        problems,
        start_time: startTime,
        end_time: endTime,
        status
      },
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

// Delete a contest
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

// Get a contest by ID
export const getContestById = async (req, res) => {
  const { id } = req.params;

  try {
    const contest = await Contest.findById(id)
      .populate('created_by')
      .populate('problems');

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    res.status(200).json(contest);
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

    // Update status for each contest based on current time
    const now = new Date();
    contests.forEach(contest => {
      contest.status = determineStatus(contest.start_time, contest.end_time);
    });

    res.status(200).json(contests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
