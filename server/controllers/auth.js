import User from "../models/user.js";
import { StatusCodes } from "http-status-codes";
import { createToken, verifyToken } from "../utils/jwt.js";
import {
  BadRequestError,
  NotFoundError,

} from "../utils/errors.js";
import jwt from "jsonwebtoken"

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) throw new BadRequestError("ID & Password not found");

  const token = await createToken({ id: user._id });

  const oneDay = 1000 * 24 * 60 * 60; // 1 day in milliseconds
  return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // secure flag for production
        expires: new Date(Date.now() + oneDay), // 1 day expiration
      })
      .json({
        message: `Welcome back ${user.username}`,
        user,
        success: true,
      });
};


export const register = async (req, res) => {
  const isFirstUser = (await User.countDocuments()) === 0;
  if (isFirstUser) req.body.role = 'admin';
  console.log(req.body);
  const user = await User.create(req.body);
  console.log(user);
  
  return res.status(201).json({
    message: "Account created successfully.",
    success: true,
  });
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
    console.log("error found")
    console.error(error);
  }
};