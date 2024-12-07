import express from "express";
import { isAuthorized, isAdmin } from '../middlewares/auth.js';
import adminController from '../controllers/admin.controller.js';

const router = express.Router();

// peding request will be only accesible by the admin
router.route("/get-pending-users").get(isAuthorized, isAdmin, adminController.getPendingRequest);
router.route("/accept-request").post(isAuthorized, isAdmin, adminController.acceptRequest);
router.route("/accept-all-requests").post(isAuthorized, isAdmin, adminController.acceptAllRequests);
router.route("/decline-request").post(isAuthorized, isAdmin, adminController.declineRequest);
router.route("/decline-all-requests").post(isAuthorized, isAdmin, adminController.declineAllRequests);

export default router;