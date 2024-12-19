import express from "express";
import { isAuthorized, isAdmin } from '../middlewares/auth.js';
import adminController from '../controllers/admin.controller.js';
import User from "../models/user.js"; // Corrected model import

const router = express.Router();

// peding request will be only accesible by the admin
router.route("/get-pending-users").get(isAuthorized, isAdmin, adminController.getPendingRequest);
router.route("/accept-request").post(isAuthorized, isAdmin, adminController.acceptRequest);
router.route("/accept-all-requests").post(isAuthorized, isAdmin, adminController.acceptAllRequests);
router.route("/decline-request").post(isAuthorized, isAdmin, adminController.declineRequest);
router.route("/decline-all-requests").post(isAuthorized, isAdmin, adminController.declineAllRequests);

router.post("/get-faculty-by-admin", async (req, res) => {
  const { adminId, page = 1, limit = 10 } = req.body;
  console.log(req.body)

  // Validate the input
  if (!adminId) {
    return res.status(400).json({ success: false, message: "Admin ID is required." });
  }

  try {
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    // Fetch approved facultys with pagination, sorted by the latest created first
    const facultys = await User.find({role: "faculty", isApproved: true })
      .select("username branch email subject createdAt id")
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order (latest first)
      .skip(skip)
      .limit(limit);

    // Get total count of approved facultys for this faculty
    const totalStudents = await User.countDocuments({ role: "faculty", isApproved: true });

    // Calculate total pages and return data
    const totalPages = Math.ceil(totalStudents / limit);

    res.status(200).json({
      success: true,
      message: "Faculty fetched successfully.",
      facultys,
      totalPages, // Include totalPages
      currentPage: page,
      totalStudents
    });
  } catch (error) {
    console.error("Error in fetching faculty by admin ID:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

export default router;