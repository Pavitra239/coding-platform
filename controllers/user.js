import User from "../models/user.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { createToken } from "../utils/jwt.js";

// Get all users
export const getUsers = async (req, res) => {
  const users = await User.find({}, { password: 0 }); // Exclude password from the results4
  // console.log("hello")
  res.status(StatusCodes.OK).json({ status: "success", data: users });
};

// Get a single user by ID
export const getUser = async (req, res) => {
  const user = await User.findById(req.params.id, { password: 0 });
  if (!user) throw new NotFoundError("User not found");

  res.status(StatusCodes.OK).json({ status: "success", data: user });
};

// Create a new user (Admin only)
export const createUser = async (req, res) => {
  const user = await User.create(req.body);  // Create user with provided details
  const token = await createToken({ id: user._id, role: user.role });  // Generate token for the new user
  res.status(StatusCodes.CREATED).json({ status: "success", data: user, token });  // Respond with user data and token
};



// Edit a user (Admin only)
export const editUser = async (req, res) => {
  const { username, email, role } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { username, email, role },
    { new: true, runValidators: true }
  );
  if (!user) throw new NotFoundError("User not found");

  res.status(StatusCodes.OK).json({ status: "success", msg: "User updated", data: user });
};

// Delete a user (Admin only)
export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new NotFoundError("User not found");

  res.status(StatusCodes.OK).json({ status: "success", msg: "User deleted" });
};
