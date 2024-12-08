import User from "../models/user.js";
import { StatusCodes } from "http-status-codes";
import { createToken, verifyToken } from "../utils/jwt.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { id, password } = req.body; // Use `id` instead of `email`

  try {
    const user = await User.findOne({ id }); // Query by `id` instead of `email`

    if (!user) {
      return res.status(200).json({
        message: "Invalid ID & Password!",
        success: false,
      });
    }

    if (!user.isApproved) {
      return res.status(200).json({
        message: "Your registration request has not been approved yet.",
        success: false,
      });
    }

    const isPasswordValid = await user.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(200).json({
        message: "Invalid ID & Password!",
        success: false,
      });
    }

    const isFirstTime = user.firstTimeLogin;

    if (isFirstTime) {
      return res.status(200).json({
        firstTimeLogin: isFirstTime,
        message: "Welcome on your first login!",
        success: true,
      });
    }

    const token = await createToken({ id: user._id });
    const oneDay = 1000 * 60 * 60 * 24; // One day in milliseconds

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + oneDay),
      })
      .json({
        message: "Welcome back!",
        firstTimeLogin: isFirstTime,
        user,
        success: true,
        token,
      });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "An error occurred during login. Please try again later.",
      success: false,
    });
  }
};


export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required.", success: false });
    }

    let email = `${oldPassword.toLowerCase()}@charusat.edu.in`;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found.", success: false });
    }

    const isPasswordValid = await user.comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Old password is not valid.", success: false });
    }

    if (newPassword === oldPassword) {
      return res.status(400).json({ message: "New password cannot be the same as the old password.", success: false });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long.", success: false });
    }

    user.password = newPassword;
    user.firstTimeLogin = false;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully!",
      success: true
    });

  } catch (error) {
    console.error("PasswordChange error:", error);
    return res.status(500).json({
      message: "An error occurred while changing the password.",
      success: false
    });
  }
};


export const register = async (req, res) => {
  try {
    const userData = req.body;

    console.log(userData)

    const existingUser = await User.findOne({
      id: userData.id,
    });
    
    console.log(existingUser + "hello")

    if (existingUser) {
      return res.status(400).json({
        message: "A registration request has already been sent from this ID.",
        success: false,
      });
    }

    const user = await User.create(userData);
    console.log(user);

    return res.status(201).json({
      message: "The registration request has been sent successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(400).json({
      message: error.message || "Failed to create account.",
      success: false,
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  const decoded = await verifyToken(token);
  const user = await User.findByIdAndUpdate(decoded.id, { verified: true });
  if (!user) throw new NotFoundError("invalid");

  await successEmail(user.email);
  res.status(StatusCodes.OK).json({ status: "success", msg: "email verified" });
};

export const logout = async (req, res) => {
  res.cookie("token", "logout", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res
    .status(StatusCodes.OK)
    .json({ status: "success", msg: "User logged out" });
};

export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;

    // console.log("token " + token);

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const decoded = jwt.verify(token, "ChauhanRutvik");
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log("error found");
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};