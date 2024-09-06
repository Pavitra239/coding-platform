import User from "../models/user.js";
import { StatusCodes } from "http-status-codes";
import { createToken, verifyToken } from "../utils/jwt.js";
import {
  BadRequestError,
  NotFoundError,

} from "../utils/errors.js";

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) throw new BadRequestError("ID & Password not found");

  const token = await createToken({ id: user._id });
  // console.log("Generated JWT Token:", token);

  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
  });
  res.status(StatusCodes.OK).json({ status: "success", msg: "logged in!" });
};

export const register = async (req, res) => {
  const isFirstUser = (await User.countDocuments()) === 0;
  if (isFirstUser) req.body.role = 'admin';
  const user = await User.create(req.body);
  const token = await createToken({ id: user._id,role: user.role });
  // await verficationEmail(user.email, token);
  res
    .status(StatusCodes.CREATED)
    .json({ status: "success", msg: "registered!" });
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
