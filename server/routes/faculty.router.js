import express from "express";
import { isAuthorized, isFaculty } from "../middlewares/auth.js";
import facultyController from "../controllers/faculty.controller.js";
import User from "../models/user.js"; // Corrected model import

const router = express.Router();

// Pending request routes
router
  .route("/get-pending-users")
  .get(isAuthorized, isFaculty, facultyController.getPendingRequest);
router
  .route("/accept-request")
  .post(isAuthorized, isFaculty, facultyController.acceptRequest);
router
  .route("/accept-all-requests")
  .post(isAuthorized, isFaculty, facultyController.acceptAllRequests);
router
  .route("/decline-request")
  .post(isAuthorized, isFaculty, facultyController.declineRequest);
router
  .route("/decline-all-requests")
  .post(isAuthorized, isFaculty, facultyController.declineAllRequests);

// Bulk Registration Route
router.post("/bulk-register", async (req, res) => {
  const { students, facultyId } = req.body;

  if (!facultyId) {
    return res.status(400).json({ message: "Faculty ID is required." });
  }

  if (!students || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: "Invalid or missing students data." });
  }

  try {
    // Validate faculty ID
    const faculty = await User.findById(facultyId);
    if (!faculty || faculty.role !== "faculty") {
      return res.status(404).json({ message: "Faculty not found or invalid." });
    }

    const results = { success: [], errors: [] };

    // Bulk register students
    for (const student of students) {
      const { username, id, batch, semester } = student;
    
      if (!username || !id || !batch || !semester) {
        console.log("hello")
        results.errors.push({ id, message: "Incomplete student data." });
        continue;
      }
    
      // Determine the branch based on the 'id'
      let branchCode;
      console.log(id);
      if (id.includes("it")) {
        branchCode = "it";
      } else if (id.includes("ce")) {
        branchCode = "ce";
      } else if (id.includes("cse")) {
        branchCode = "cse";
      } else {
        branchCode = "unknown"; // Handle cases where the branch is not identified
      }

      if(branchCode === "unknown") {
        results.errors.push({ id, message: "ID number is not correct" });
      }
    
      // Generate the branch code based on the identified branch
      const branch = `cspit-${branchCode}`;
      console.log("Branch code:", branch);
    
      const role = "student";
      const password = id; // Default password is student ID
      const emailDomain = "@charusat.edu.in";
      const email = `${id.toLowerCase()}${emailDomain}`;
    
      try {
        const existingUser = await User.findOne({ id });
        if (existingUser) {
          results.errors.push({ id, message: "User already exists." });
          continue;
        }
    
        const newUser = new User({
          username,
          id,
          email,
          batch,
          semester,
          password,
          role,
          isApproved: true,
          facultyId,
          branch, // Add the branch code to the user object
        });

        console.log("New user:", newUser);
    
        await newUser.save();
        results.success.push({ id, message: "User registered successfully." });
      } catch (error) {
        console.error("Error registering user:", error);
        results.errors.push({ id, message: "Error registering user." });
      }
    }
    

    res.json({ message: "Bulk registration completed.", results });
  } catch (error) {
    console.error("Error in bulk registration:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Register Single Student
router.post("/get-students-by-faculty", async (req, res) => {
  const { facultyId, page = 1, limit = 10 } = req.body;

  // Validate the input
  if (!facultyId) {
    return res.status(400).json({ success: false, message: "Faculty ID is required." });
  }

  try {
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    // Fetch approved students with pagination, sorted by the latest created first
    const students = await User.find({ facultyId, role: "student", isApproved: true })
      .select("username batch branch semester id createdAt")
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order (latest first)
      .skip(skip)
      .limit(limit);

    // Get total count of approved students for this faculty
    const totalStudents = await User.countDocuments({ facultyId, role: "student", isApproved: true });

    // Calculate total pages and return data
    const totalPages = Math.ceil(totalStudents / limit);

    res.status(200).json({
      success: true,
      message: "Students fetched successfully.",
      students,
      totalPages, // Include totalPages
      currentPage: page,
      totalStudents
    });
  } catch (error) {
    console.error("Error in fetching students by faculty ID:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Remove User by ID
router.delete("/remove-user/:userId", async (req, res) => {
  const { userId } = req.params;

  console.log("User ID received:", userId);

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing User ID." });
  }

  try {
    // Check if the user exists using a field that matches the ID type
    const user = await User.findOne({ id: userId }); // Adjust query based on your schema
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    console.log("User found:", user);

    // Remove the user
    await User.deleteOne({ id: userId }); // Adjust based on your schema

    return res.status(200).json({
      success: true,
      message: `User with ID ${userId} has been successfully removed.`,
    });
  } catch (error) {
    console.error("Error in removing user:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});









export default router;
