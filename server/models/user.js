import mongoose, { mongo } from 'mongoose';
import { ROLES } from '../utils/constants.js';
import { hash, compare } from "bcrypt";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'username is required'],
    },
    email: {
      type: String,
      required: [true, 'email is required'],
    },
    password: {
      type: String,
      required: [true, 'password is required'],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    profile: {
      name: {
        type: String,
        required: [true, 'name is required'],
      },
      bio: {
        type: String,
      },
      avatar: {
        type: String,
      },
    },
    submissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Submission',
      },
    ],
  },
  {}
);

// export default mongoose.model('User', userSchema);


userSchema.pre("save", async function () {
  this.password = await hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  const isValid = await compare(password, this.password);
  return isValid;
};

export default mongoose.model("User", userSchema);
