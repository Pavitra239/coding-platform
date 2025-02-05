import Problem from "../models/problem.js";
import Code from "../models/Code.js";
import Submission from "../models/submission.js";
import user from "../models/user.js";
import mongoose from "mongoose";

// Create problem
// export const createProblem = async (req, res) => {
//   const {
//     title,
//     description,
//     difficulty,
//     inputFormat,
//     outputFormat,
//     sampleIO,
//     testCases = [], // Default to an empty array if undefined
//     constraints,
//     tags,
//     createdBy,
//     totalMarks
//     } = req.body;

//   console.log("testCases", testCases);

//   try {
//     const problem = new Problem({
//       title,
//       description,
//       difficulty,
//       inputFormat,
//       outputFormat,
//       sampleIO,
//       testCases: testCases.map((testCase) => ({
//         inputs: testCase.inputs.map((input, index) => ({
//           value: input,
//           type: testCase.inputTypes[index], // Use index to get corresponding type
//         })),
//         outputs: testCase.outputs.map((output, index) => ({
//           value: output,
//           type: testCase.outputTypes[index], // Use index to get corresponding type
//         })),
//         marks: testCase.marks, // Assign marks for the test case
//         timeLimit: testCase.timeLimit, // Include timeLimit if provided
//         memoryLimit: testCase.memoryLimit, // Include memoryLimit if provided
//       })),
//       constraints,
//       tags,
//       totalMarks,
//       createdBy: req.user?._id || createdBy,
//     });

//     const createdProblem = await problem.save();
//     res.status(201).json(createdProblem);
//   } catch (error) {
//     console.log(error + " error");
//     res.status(400).json({ message: error.message });
//   }
// };

export const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    inputFormat,
    outputFormat,
    sampleIO,
    testCases = [], // Default to an empty array if undefined
    constraints,
    tags,
    totalMarks,
    createdBy
  } = req.body;

  // Enhanced logging for testCases to check the raw input structure
  console.log("Received testCases raw:", testCases);
  if (Array.isArray(testCases)) {
    testCases.forEach((testCase, index) => {
      console.log(`TestCase ${index + 1}:`, JSON.stringify(testCase, null, 2));
    });
  } else {
    console.error("Received testCases is not an array:", testCases);
  }

  try {
    // Create a new Problem document using the provided data
    const problem = new Problem({
      title,
      description,
      difficulty,
      inputFormat,
      outputFormat,
      sampleIO: sampleIO.map((sample) => ({
        input: sample.input, // Input as a string (e.g., "3 3 1 2 3 4 5 6 7 8 9")
        output: sample.output, // Output as a string (e.g., "6 15 24 12 15 18")
      })),
      testCases: testCases.map((testCase) => ({
        inputs: testCase.inputs, // Store the input as a single string (e.g., "1 2 3 4")
        outputs: testCase.outputs, // Store the output as a single string (e.g., "10")
        marks: testCase.marks || 0, // Ensure marks are set, defaulting to 0
      })),
      constraints,
      tags,
      totalMarks,
      createdBy
    });

    // Save the problem to the database
    const createdProblem = await problem.save();
    console.log("Created Problem:", createdProblem);

    // Respond with the created problem
    res.status(201).json(createdProblem);
  } catch (error) {
    console.error("Error creating problem:", error);
    res.status(400).json({ message: error.message }); // Return error message if something goes wrong
  }
};


// Backend code (Express.js route handler)
export const getProblems = async (req, res) => {
  try {
    let problems;
    console.log("req.user3", req.user);
    if (req.user.isAdmin === "admin") {
      problems = await Problem.find({}).sort({ createdAt: -1 });
    } else if (req.user.isAdmin === "faculty") {
      problems = await Problem.find({ createdBy: req.user.id }).sort({
        createdAt: -1,
      });
    } else if (req.user.isAdmin === "student") {
      console.log("req.user.id", req.user.id);
      problems = await Problem.find({ assignedStudents: req.user.id }).sort({
        createdAt: -1,
      });
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    res.json({
      problems: problems.map(({ _id, title, difficulty, createdAt}) => ({
        _id,
        title,
        difficulty,
        createdAt,
      })),
      totalProblems: problems.length,
      success: true,
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignProblemToStudents = async (req, res) => {
  const { id } = req.params;
  const { studentIds } = req.body; // Array of student IDs

  try { 
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    console.log("hello")

    // Add students to the assigned list
    problem.assignedStudents.push(...studentIds);
    console.log("problem.assignedStudents", problem.assignedStudents);
    await problem.save();
    console.log("problem", problem);

    res
      .status(200)
      .json({ message: "Students assigned successfully", problem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unassignStudents = async (req, res) => {
  const { id } = req.params; // Problem ID
  const { studentIds } = req.body; // Array of student IDs to unassign
  console.log(studentIds);

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ message: "No student IDs provided." });
  }

  try {
    // Fetch the problem by ID
    const problem = await Problem.findById(id);

    if (!problem) {
      console.error(`Problem with ID ${id} not found.`);
      return res.status(404).json({ message: "Problem not found" });
    }

    // Filter out the students to be unassigned
    const updatedAssignedStudents = problem.assignedStudents.filter(
      (studentId) => !studentIds.includes(studentId.toString())
    );

    // Update the problem with the new list of assigned students
    problem.assignedStudents = updatedAssignedStudents;
    await problem.save();

    console.log(`Unassigned Students: ${studentIds}`);

    // Return success response
    res.status(200).json({
      message: "Students unassigned successfully",
    });
  } catch (error) {
    console.error(`Error unassigning students: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

export const getProblemWithStudents = async (req, res) => {
  const { id } = req.params; // Problem ID

  try {
    // Fetch the problem by ID
    const problem = await Problem.findById(id);

    if (!problem) {
      console.error(`Problem with ID ${id} not found.`);
      return res.status(404).json({ message: "Problem not found" });
    }

    // Fetch all students assigned to this problem
    const assignedStudents = problem.assignedStudents.map(
      (studentId) => new mongoose.Types.ObjectId(studentId) // Ensure consistent ObjectId type
    );

    // console.log(`Assigned Students IDs: ${assignedStudents}`);

    // Find users corresponding to the assigned student IDs
    const assignedStudentData = await user
      .find(
        { _id: { $in: assignedStudents } } // Fetch matching users
      )
      .select("username semester batch branch id _id") // Include only specific fields
      .sort({ id: 1 }); // Sort by `id` in ascending order

    if (!assignedStudentData.length) {
      console.warn(`No assigned students found for Problem ID ${id}.`);
    }

    // Return the problem and assigned student data
    res.status(200).json({
      message: "Problem and assigned students fetched successfully",
      assignedStudents: assignedStudentData,
    });
  } catch (error) {
    console.error(`Error fetching problem and students: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

export const getProblemWithUnassignedStudents = async (req, res) => {
  const { id } = req.params; // Problem ID
  console.log("Problem ID:22", id);

  try {
    // Fetch the problem by ID
    const problem = await Problem.findById(id);

    if (!problem) {
      console.error(`Problem with ID ${id} not found.`);
      return res.status(404).json({ message: "Problem not found" });
    }

    // Fetch all students assigned to this problem
    const assignedStudents = problem.assignedStudents.map(
      (studentId) => new mongoose.Types.ObjectId(studentId) // Ensure consistent ObjectId type
    );

    console.log(`Assigned Students IDs: ${assignedStudents}`);

    // Fetch all users who are NOT assigned to the problem and have the role of "student"
    const unassignedStudentData = await user
      .find({
        _id: { $nin: assignedStudents }, // Exclude assigned students
        role: "student", // Include only users with role "student"
      })
      .select("username semester batch branch id _id") // Include only specific fields
      .sort({ id: 1 }); // Sort by ID in ascending order

    if (!unassignedStudentData.length) {
      console.warn(`No unassigned students found for Problem ID ${id}.`);
    }

    // Return the problem and unassigned student data
    res.status(200).json({
      message: "Problem and unassigned students fetched successfully",
      unassignedStudents: unassignedStudentData,
    });
  } catch (error) {
    console.error(
      `Error fetching problem and unassigned students: ${error.message}`
    );
    res.status(500).json({ message: error.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    // Fetching all students
    const students = await user
      .find({ role: "student" })
      .select("username semester batch branch id _id")
      .sort({ id: 1 });

    // Calculate total number of students
    const totalStudents = students.length;

    // Aggregate data for branch-wise count
    const branchWiseCount = await user.aggregate([
      { $match: { role: "student" } },
      { $group: { _id: "$branch", count: { $sum: 1 } } },
    ]);

    // Aggregate data for semester, branch, and batch-wise count
    const semesterBranchBatchWiseCount = await user.aggregate([
      { $match: { role: "student" } },
      {
        $group: {
          _id: { semester: "$semester", branch: "$branch", batch: "$batch" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.semester": 1, "_id.branch": 1, "_id.batch": 1 } }, // Sort by semester, branch, and batch
    ]);

    // Prepare a structured response to include semester, branch, and batch-wise breakdowns
    const semesterBranchBatchWiseCountResult = semesterBranchBatchWiseCount.reduce(
      (acc, { _id, count }) => {
        const { semester, branch, batch } = _id;
        if (!acc[semester]) {
          acc[semester] = {}; // Initialize object for each semester
        }
        if (!acc[semester][branch]) {
          acc[semester][branch] = {}; // Initialize object for each branch within the semester
        }
        if (!acc[semester][branch][batch]) {
          acc[semester][branch][batch] = 0; // Initialize count for each batch within the branch and semester
        }
        acc[semester][branch][batch] += count; // Aggregate the count for each batch in each branch and semester
        return acc;
      },
      {}
    );

    // Send the students data along with total and counts
    console.log(
      "semesterBranchBatchWiseCountResult",
      semesterBranchBatchWiseCountResult
    );
    console.log("branchWiseCount", branchWiseCount);
    console.log("students", totalStudents);
    res.status(200).json({
      totalStudents,
      branchWiseCount,
      semesterBranchBatchWiseCount: semesterBranchBatchWiseCountResult,
      students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      message: "Server error while fetching students",
      error: error.message,
    });
  }
};

// Get problem by ID
export const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the problem from the database
    // const problem = await Problem.findById(id);
    const problem = await Problem.findById(id).select("-assignedStudents -createdAt -updatedAt -createdBy");


    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Ensure req.user is properly populated
    if (!req.user) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const { id: userId, isAdmin } = req.user;
    console.log("req.user", req.user);

    // Admins have unrestricted access
    if (isAdmin === "admin") {
      return res.json(problem);
    }

    // Faculty can access only the problems they created
    if (isAdmin === "faculty") {
      console.log("problem.createdBy", problem.createdBy.toString());
      console.log("userId", userId.toString());

      if (problem.createdBy.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "You are not allowed to access this problem" });
      }
      return res.json(problem);
    }

    // Students can only access problems assigned to them
    if (isAdmin === "student") {
      const isAssigned = problem.assignedStudents.some(
        (student) => student.toString() === userId.toString()
      );
      if (!isAssigned) {
        return res
          .status(403)
          .json({ message: "You are not allowed to access this problem" });
      }
      return res.json(problem);
    }

    // Default deny for other roles
    return res
      .status(403)
      .json({ message: "You are not allowed to access this problem" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update problem
// export const updateProblem = async (req, res) => {
//   try {
//     const problem = await Problem.findById(req.params.id);

//     if (!problem) {
//       return res.status(404).json({ message: "Problem not found" });
//     }

//     const {
//       sampleIO,
//       testCases,
//       ...otherUpdates // Extract other fields for direct assignment
//     } = req.body;

//     // Update sampleIO if provided
//     if (sampleIO) {
//       problem.sampleIO = sampleIO.map((sample) => ({
//         input: sample.input,
//         output: sample.output,
//       }));
//     }

//     // Update testCases if provided
//     if (testCases) {
//       problem.testCases = testCases.map((testCase) => ({
//         inputs: testCase.inputs.map((input, index) => ({
//           value: input,
//           type: testCase.inputTypes?.[index], // Safely access inputTypes
//         })),
//         outputs: testCase.outputs.map((output, index) => ({
//           value: output,
//           type: testCase.outputTypes?.[index], // Safely access outputTypes
//         })),
//         timeLimit: testCase.timeLimit,
//         memoryLimit: testCase.memoryLimit,
//         marks: testCase.marks || 0, // Default marks to 0 if not provided
//       }));
//     }

//     // Assign other updates directly
//     Object.assign(problem, otherUpdates);

//     // Save updated problem
//     const updatedProblem = await problem.save();

//     res.json(updatedProblem);
//   } catch (error) {
//     console.error("Update Problem Error:", error); // Log the error for debugging
//     res
//       .status(500)
//       .json({ message: "Failed to update problem. Please try again later." });
//   }
// };


export const updateProblem = async (req, res) => {
  try {
    // Find the problem by its ID
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Extract the fields from the request body for updating
    const {
      sampleIO,
      testCases,
      ...otherUpdates // Extract other fields for direct assignment
    } = req.body;

    // Log the received test cases for debugging
    console.log("Received testCases raw:", testCases);
    if (Array.isArray(testCases)) {
      testCases.forEach((testCase, index) => {
        console.log(`TestCase ${index + 1}:`, JSON.stringify(testCase, null, 2));
      });
    } else {
      console.error("Received testCases is not an array:", testCases);
    }

    // Update sampleIO if provided
    if (sampleIO) {
      problem.sampleIO = sampleIO.map((sample) => ({
        input: sample.input, // Ensure input is a string
        output: sample.output, // Ensure output is a string
      }));
    }

    // Update testCases if provided
    if (testCases) {
      problem.testCases = testCases.map((testCase) => ({
        inputs: testCase.inputs, // Ensure inputs are a string
        outputs: testCase.outputs, // Ensure outputs are a string
        marks: testCase.marks || 0, // Default marks to 0 if not provided
      }));
    }

    // Assign other updates directly to the problem object
    Object.assign(problem, otherUpdates);

    // Save the updated problem to the database
    const updatedProblem = await problem.save();
    console.log("Updated Problem:", updatedProblem);

    // Send the updated problem back as a response
    res.json(updatedProblem);
  } catch (error) {
    console.error("Update Problem Error:", error); // Log error for debugging
    res.status(500).json({
      message: "Failed to update the problem. Please try again later.",
    });
  }
};


// Delete problem
export const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Delete the problem
    await Problem.deleteOne({ _id: req.params.id });

    // Delete all related codes
    await Code.deleteMany({ problemId: req.params.id });

    // Delete all related submissions
    await Submission.deleteMany({ problem_id: req.params.id });

    res.json({ message: "Problem and all related data removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
