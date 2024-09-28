import User from "../models/user.js";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";
import { verifyToken } from "../utils/jwt.js";

export const isAuthorized = async (req, res, next) => {
  
  if (!req.headers.cookie) throw new UnauthorizedError("please login!");
  const token = req.headers.cookie.slice(6);
  const decoded = await verifyToken(token);
  const user = await User.findById(decoded.id, { password: 0 });
  if (!user) throw new UnauthorizedError("invalid user");
  req.user = {
    id: user._id,
    isAdmin: user.role,
  };
  next();
};

export const isAdmin = (req, res, next) => {
  console.log(req.user);
  if (req.user && req.user.isAdmin === "admin") {
    // Allow access if the user is an admin
    return next();
  }
  // Deny access if the user is not an admin
  throw new ForbiddenError("You are not allowed to access this route");
};
