import mongoose from "mongoose";
import { STATUS } from "../utils/constants.js";
const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "name is required"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "description is required"],
    },
    status: {
      type: String,
      default: STATUS.PENDING,
      enum: Object.values(STATUS),
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);
