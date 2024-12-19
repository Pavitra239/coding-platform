import User from "../models/user.js";
import { StatusCodes } from "http-status-codes";
import { createToken, verifyToken } from "../utils/jwt.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  console.log("Api hit");
  const { id, email, password } = req.body;
  console.log(id, email, password);

  try {
    let user;
    if (id) {
      user = await User.findOne({ id });
    } else if (email) {
      user = await User.findOne({ email });
    }

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
    const oneDay = 1000 * 60 * 60 * 24;

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
      return res
        .status(400)
        .json({ message: "All fields are required.", success: false });
    }

    let email = `${oldPassword.toLowerCase()}@charusat.edu.in`;
    let facultyEmail = `${oldPassword.toLowerCase()}@charusat.ac.in`;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.findOne({ email: facultyEmail });
    }

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found.", success: false });
    }

    if (!user.isApproved) {
      return res
        .status(404)
        .json({ message: "You are not approved yet.", success: false });
    }

    const isPasswordValid = await user.comparePassword(
      oldPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Old password is not valid.", success: false });
    }

    if (newPassword === oldPassword) {
      return res
        .status(400)
        .json({
          message: "New password cannot be the same as the old password.",
          success: false,
        });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({
          message: "New password must be at least 6 characters long.",
          success: false,
        });
    }

    user.password = newPassword;
    user.firstTimeLogin = false;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully!",
      success: true,
    });
  } catch (error) {
    console.error("PasswordChange error:", error);
    return res.status(500).json({
      message: "An error occurred while changing the password.",
      success: false,
    });
  }
};

export const register = async (req, res) => {
  try {
    const userData = req.body;

    if (!userData.id && !userData.email) {
      return res
        .status(400)
        .json({ message: "ID or email is required.", success: false });
    }

    console.log(userData);
    let existingUser = "op";
    if (userData.role === "student") {
      existingUser = await User.findOne({ id: userData.id });
    } else if (userData.role === "faculty") {
      existingUser = await User.findOne({ email: userData.email });
    }

    console.log(existingUser + "hello");

    if (existingUser) {
      if (existingUser.isApproved === false) {
        return res.status(409).json({
          message: `A ${userData.role} with this ${
            userData.role === "student" ? "ID" : "email"
          } request not Approved.`,
          success: false,
        });
      }
      return res.status(409).json({
        message: `A ${userData.role} with this ${
          userData.role === "student" ? "ID" : "email"
        } already exists.`,
        success: false,
      });
    }

    console.log(userData);

    if (userData.role === "faculty") {
      const facultyEmailPattern = /^[a-zA-Z0-9._%+-]+@charusat\.ac\.in$/;

      if (!facultyEmailPattern.test(userData.email)) {
        throw new Error(
          `Invalid email for faculty. Faculty email must match the pattern "name@charusat.ac.in".`
        );
      }
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

export const fetchSubjects = async (req, res) => {
  try {
    const subjects = await User.find({
      role: "faculty",
      isApproved: true,
    }).select("subject _id username");

    if (!subjects || subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No subjects found for faculty.",
      });
    }

    const subjectList = subjects.map((faculty) => ({
      id: faculty._id,
      subject: faculty.subject,
      teacher: faculty.username,
    }));

    // Return success response with subject list
    return res.status(200).json({
      success: true,
      subjects: subjectList,
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching subjects.",
      error: error.message,
    });
  }
};
