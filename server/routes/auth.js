import express from "express";
import { login, logout, register, verifyEmail, getCurrentUser, changePassword } from "../controllers/auth.js";
import {
  loginInputValidator,
  registerInputValidator,
} from "../middlewares/validation.js";

const router = express.Router();
router.route("/login").post(loginInputValidator, login);
router.route("/register").post(register);
router.route("/verify").get(verifyEmail);
router.route("/logout").get(logout);
router.route("/get-current-user").get(getCurrentUser);
router.route("/change-password").post(changePassword);
// forget password

export default router;