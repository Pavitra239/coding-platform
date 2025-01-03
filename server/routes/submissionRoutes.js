import express from "express";
import Submission from "../models/submission.js";
import { isAuthorized } from "../middlewares/auth.js";
const router = express.Router();
router.use(isAuthorized);

// Route to create a new submission
router.post("/", async (req, res) => {
  try {
    // Destructure the body to extract relevant fields
    const {
      user_id,
      problem_id,
      code,
      language,
      status,
      execution_time,
      memory_usage,
      testCaseResults,
      numberOfTestCase,
      numberOfTestCasePass,
      totalMarks,
    } = req.body;

    console.log(req.body);
    console.log("hello22");
    // Validate testCaseResults
    if (!testCaseResults || !Array.isArray(testCaseResults)) {
      return res.status(400).json({
        message: "Test case results are required and must be an array.",
      });
    }

    console.log("hello1");
    console.log(testCaseResults);

    // Deep validation for testCaseResults array
    if (
      !testCaseResults.every(
        (tc) =>
          tc.input &&
          tc.output &&
          tc.expectedOutput !== undefined &&
          typeof tc.passed === "boolean"
      )
    ) {
      return res.status(400).json({
        message:
          "Each test case result must include inputs, outputs, expectedOutputs, and passed.",
      });
    }

    console.log("hello2");

    // Create a new submission
    const submission = new Submission({
      user_id,
      problem_id,
      code,
      language,
      status: status || STATUS.PENDING, // Default to PENDING if not provided
      execution_time: execution_time || 0, // Default to 0
      memory_usage: memory_usage || 0, // Default to 0
      testCaseResults,
      numberOfTestCase,
      numberOfTestCasePass,
      totalMarks,
    });

    // Save the submission to the database
    console.log("Submission to Save:", submission);
    await submission.save();

    // Respond with success
    res.status(201).json({
      message: "Submission created successfully",
      submission, // Return the full submission object
    });
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(400).json({
      message:
        error.message ||
        "An unexpected error occurred during submission creation.",
    });
  }
});

// Route to get submissions for a specific user and problem
router.get("/", async (req, res) => {
  const { user_id, problem_id } = req.query;

  try {
    // Find submissions by user_id and problem_id, and populate user and problem data
    const submissions = await Submission.find({ user_id, problem_id })
      .populate("user_id", "name") // Populate user's name
      .populate("problem_id", "title"); // Populate problem's title

    // If no submissions found, return a 404
    if (submissions.length === 0) {
      return res.status(404).json({
        message: "No submissions found for the given user and problem.",
      });
    }

    res.status(200).json(submissions);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// Route to get all submissions
router.get("/problem", async (req, res) => {
  const { problem_id } = req.query;

  console.log(problem_id);

  try {
    // Fetch all submissions for the given problem_id
    const submissions = await Submission.find(
      { problem_id },
      {
        language: 1,
        status: 1,
        numberOfTestCase: 1,
        numberOfTestCasePass: 1,
        _id: 1,
        createdAt: 1,
        totalMarks: 1,
      }
    )
      .populate({
        path: "user_id",
        select: "id username batch branch semester _id role",
        match: { role: "student" }, // Only include users with role 'student'
      });

    // Filter out submissions where user_id is null (non-students)
    const filteredSubmissions = submissions.filter(submission => submission.user_id);

    if (filteredSubmissions.length === 0) {
      return res
        .status(404)
        .json({ message: "No submissions found for the given problem ID." });
    }

    // Create a map to store the highest marks submission for each student
    const highestMarksSubmissions = {};

    // Loop through filtered submissions and select the highest marks submission for each user
    filteredSubmissions.forEach((submission) => {
      const userId = submission.user_id._id.toString(); // Convert user_id to string to use as key in map
      if (!highestMarksSubmissions[userId] || submission.totalMarks > highestMarksSubmissions[userId].totalMarks) {
        highestMarksSubmissions[userId] = submission;
      }
    });

    // Get the values from the highestMarksSubmissions map (these are the highest marks submissions for each student)
    const highestMarksSubmissionsArray = Object.values(highestMarksSubmissions);

    res.status(200).json({
      message: "Submissions retrieved successfully",
      submissions: highestMarksSubmissionsArray,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});



// Route to get all submissions for specific user
router.get("/user/submissions", async (req, res) => {
  const { user_id, page = 1, limit = 10 } = req.query;

  console.log(`User ID: ${user_id}, Page: ${page}, Limit: ${limit}`);

  try {
    console.log("hello");
    const submissions = await Submission.find({ user_id }) // Filter by user_id
      .populate("problem_id", "title") // Populate problem details: title and description
      .sort({ createdAt: -1 }) // Sort by creation time, descending
      .skip((page - 1) * limit) // Skip records for pagination
      .limit(parseInt(limit)) // Limit the number of records
      .select({
        language: 1,
        status: 1,
        numberOfTestCase: 1,
        numberOfTestCasePass: 1,
        _id: 1,
        createdAt: 1,
        totalMarks: 1,
      }) // Include only these fields in the final output

    // console.log(submissions)

    const totalSubmissions = await Submission.countDocuments({ user_id }); // Count total submissions

    if (submissions.length === 0) {
      console.log("hello2");
      return res
        .status(404)
        .json({ message: "No submissions found for the given user." });
    }

    console.log("hello3");
    res.status(200).json({
      message: "Submissions retrieved successfully",
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

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const submission = await Submission.findById(id).populate("problem_id", "title");
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    console.log(submission);
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
