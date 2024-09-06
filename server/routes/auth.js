import express from "express";
import { login, logout, register, verifyEmail } from "../controllers/auth.js";
import {
  loginInputValidator,
  registerInputValidator,
} from "../middlewares/validation.js";
const router = express.Router();
router.route("/login").post(loginInputValidator, login);
router.route("/register").post(registerInputValidator, register);
router.route("/verify").get(verifyEmail);
router.route("/logout").get(logout);

export default router;
