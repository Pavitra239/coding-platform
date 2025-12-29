import express from "express";
import { isAuthorized, isFaculty } from '../middlewares/auth.js';
import facultyController from '../controllers/faculty.controller.js';

const router = express.Router();

// peding request will be only accesible by the admin
router.route("/get-pending-users").get(isAuthorized, isFaculty, facultyController.getPendingRequest);
router.route("/accept-request").post(isAuthorized, isFaculty, facultyController.acceptRequest);
router.route("/accept-all-requests").post(isAuthorized, isFaculty, facultyController.acceptAllRequests);
router.route("/decline-request").post(isAuthorized, isFaculty, facultyController.declineRequest);
router.route("/decline-all-requests").post(isAuthorized, isFaculty, facultyController.declineAllRequests);

export default router;