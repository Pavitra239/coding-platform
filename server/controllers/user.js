import User from "../models/user.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../utils/errors.js";
import { createToken } from "../utils/jwt.js";
import { GridFSBucket } from "mongodb";
import { mongoose } from "../app.js";

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
  const user = await User.create(req.body); // Create user with provided details
  const token = await createToken({ id: user._id, role: user.role }); // Generate token for the new user
  res
    .status(StatusCodes.CREATED)
    .json({ status: "success", data: user, token }); // Respond with user data and token
};

import jwt from "jsonwebtoken";

// Edit a user (Admin only)
// Edit a user (Admin only)
export const updateUser = async (req, res) => {
  try {
    const {
      username,
      gender,
      location,
      birthday,
      github,
      skills,
      education,
      linkedIn,
      name,
      bio,
      email,
    } = req.body;

    console.log(req.body);

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    console.log(token);
    let decoded;
    try {
      decoded = jwt.verify(token, "ChauhanRutvik");
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired token", success: false });
    }

    
    const user = await User.findById(decoded.id);
    console.log(user);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Ensure fullName and name are not empty strings
    console.log("Name: ", name);
    console.log("Full Name: ", username);
    if (!username?.trim() || !name?.trim()) {
      return res.status(400).json({
        message: "Username and profile name cannot be empty.",
        success: false,
      });
    }

    console.log("User: ", user);
    user.username = username;
    user.profile.name = name;
    user.email = email;
    user.profile = Object.assign(user.profile, {
      bio: bio,
      gender: gender,
      location: location,
      birthday: birthday,
      github: github,
      skills: skills,
      education: education,
      linkedIn: linkedIn,
    });

    console.log("--> ", user);

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        username: user.username,
        profile: user.profile,
        email: user.email,
      },
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Delete a user (Admin only)
export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new NotFoundError("User not found");

  res.status(StatusCodes.OK).json({ status: "success", msg: "User deleted" });
};

export const uploadProfilePic = async (req, res) => {
  console.log("Api is hit");
  try {
    const userId = req.user.id;
    console.log("this is profileUSer: ", userId);
    const file = req.file;

    if (!userId || !file) {
      return res.status(400).json({ error: "User ID and file are required" });
    }

    await User.findByIdAndUpdate(userId, {
      $set: {
        "profile.avatar": file.id,
      },
    });

    res.json({
      message: "Avatar uploaded successfully",
      fileId: file.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getProfilePic = async (req, res) => {
  console.log("API hit OK");

  try {
    const userId = req.user.id;
    console.log("User ID:", userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const fileId = user.profile?.avatar;
    console.log("Profile File ID:", fileId);

    if (!fileId) {
      return res.status(404).json({ error: "Profile picture not found" });
    }

    // Ensure fileId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const fileIdObject =
      fileId instanceof mongoose.Types.ObjectId
        ? fileId
        : new mongoose.Types.ObjectId(fileId);

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    const fileStream = bucket.openDownloadStream(fileIdObject);
    res.set("Content-Type", "image/jpeg");

    fileStream.on("error", (error) => {
      console.error("Error streaming file:", error);
      if (!res.headersSent) {
        return res
          .status(500)
          .json({ error: "Failed to retrieve profile picture" });
      }
    });

    fileStream.on("end", () => {
      console.log("Profile picture stream completed.");
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error("Error fetching profile picture:", error);

    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to retrieve profile picture" });
    }
  }
};

export const removeProfilePic = async (req, res, next) => {
  console.log('removeProfilePic API called');
  const startTime = Date.now();

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User does not exist.' });
    }

    const fileId = user.profile?.avatar;
    if (!fileId) {
      console.log('Avatar not found');
      return res.status(404).json({ message: 'Avatar does not exist.' });
    }

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      console.log('Invalid file ID');
      return res.status(400).json({ message: 'Invalid file ID' });
    }

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    console.log('Starting delete process at:', startTime);

    bucket.delete(new mongoose.Types.ObjectId(fileId), async (err) => {
      if (err) {
        console.error('Error removing file:', err);
        return res.status(500).json({ message: 'Error removing avatar.' });
      }

      console.log("Till here");
      try {
        user.profile.avatar = null;
        await user.save();
      } catch (saveError) {
        console.error('Error saving user:', saveError);
        return res.status(500).json({ message: 'Error saving user.' });
      }

      const endTime = Date.now();
      console.log(`Avatar removed successfully in ${endTime - startTime}ms`);

      return res.status(200).json({ message: 'Avatar removed successfully.' });
    });
  } catch (error) {
    console.error('Error removing profile picture:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};