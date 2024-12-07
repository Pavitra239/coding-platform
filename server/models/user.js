import mongoose, { mongo } from "mongoose";
import { ROLES, SEM, BRANCH } from "../utils/constants.js";
import bcrypt from "bcrypt";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
    },
    id: {
      type: String,
      required: [true, "id is required"],
    },
    email: {
      type: String,
    },
    mobileNo: {
      type: String,
      required: [true, "mobile no is required"],
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    branch: {
      type: String,
      enum: Object.values(BRANCH),
      default: BRANCH.CSPIT_IT,
    },
    semester: {
      type: String,
      enum: Object.values(SEM),
      default: SEM.ONE,
    },
    batch: {
      type: String,
      required: [true, 'batch is required'],
    },
    subject: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    profile: {
      name: {
        type: String,
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
  { timestamps: true }
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