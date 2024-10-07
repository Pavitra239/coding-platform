import mongoose, { mongo } from "mongoose";
import { ROLES } from "../utils/constants.js";
import bcrypt from "bcrypt";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    profile: {
      name: {
        type: String,
        required: [true, "name is required"],
      },
      bio: {
        type: String,
      },
      avatar: {
        type: String,
      },
      github: {
        type: String,
      },
      linkedIn: {
        type: String,
      },
      birthday: {
        type: String,
      },
      gender: {
        type: String,
      },
      skills: {
        type: String,
      },
      education: {
        type: String,
      },
      location: {
        type: String,
      },
    },
    submissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Submission",
      },
    ],
  },
  {}
);

// export default mongoose.model('User', userSchema);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); 
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next(); 
  } catch (error) {
    next(error); 
  }
});

userSchema.methods.comparePassword = async function (password, DBpassword) {
  console.log(password, DBpassword);
  const isMatch = await bcrypt.compare(password, DBpassword);
  return isMatch;
};

export default mongoose.model("User", userSchema);
