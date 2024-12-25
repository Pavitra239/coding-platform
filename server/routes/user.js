import express from "express";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
  uploadProfilePic,
  getProfilePic,
  removeProfilePic,
} from "../controllers/user.js";
import { isAuthorized, isAdmin } from "../middlewares/auth.js";
import { registerInputValidator } from "../middlewares/validation.js";
import { upload } from "../utils/multer.utils.js"

const router = express.Router();

// Middleware to ensure the user is authenticated
// router.use(isAuthorized);

// Get all users (Accessible by all authenticated users)
router.get("/", (req, res, next) => { console.log("hekfef"); next() }, getUsers);

// Get a single user by ID (Accessible by all authenticated users)
router.get("/:id", getUser);

// Create a new user (Only Admins can create users)
router.post("/", isAdmin, registerInputValidator, createUser);

// Edit a user (Only Admins can edit users)
router.put("/update", updateUser);

// Delete a user (Only Admins can delete users)
router.delete("/:id", isAdmin, deleteUser);

router.post('/upload-avatar', isAuthorized, upload.single('avatar'), uploadProfilePic);
// router.get('/profile-pic', isAuthorized, getProfilePic);
router.get('/profile/upload-avatar', isAuthorized, getProfilePic);

router.delete('/profile/remove-profile-pic', isAuthorized, removeProfilePic);

export default router;