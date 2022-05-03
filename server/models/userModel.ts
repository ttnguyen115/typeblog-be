import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add your name"],
      trim: true,
      maxLength: [20, "Your name is only up to 20 characters"],
    },

    account: {
      type: String,
      required: [true, "Please add your email or phone numbers"],
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Please add your password"],
      minlength: [6, "Password must be at least 6 characters"],
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      default: "user", // admin
    },

    type: {
      type: String,
      default: "normal", // fast
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
