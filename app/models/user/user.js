import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

import { getToken } from "../../utils/functions.js";

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    password: { type: String, select: false },
    email: {
      type: String,
      unique: true,
      validate: {
        validator: function (email) {
          return validator.isEmail(email);
        },
        message: (props) => `${props.value} is not a valid email !`,
      },
    },
    phone_number: {
      type: String,
      validate: {
        validator: function (phone_number) {
          return validator.isMobilePhone(phone_number);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    role: {
      type: String,
      default: "client",
      enum: ["client", "admin"],
    },
    favorite_products: { type: mongoose.Schema.Types.Array, default: [] },
    blocked: { type: Boolean, default: false },
    image: String,
    saved_address: mongoose.Schema.Types.Array,
    deviceToken: {
      type: String,
      required: false
    },
    language: {
      type: String,
      default: 'en',
    },
  },
  { collection: "user", timestamps: true }
);



userSchema.statics.signup = async function ({
  full_name,
  phone_number,
  email,
  password,
  role,
}) {
  try {
    const User = this;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, message: "Email already registered" };
    }
    password = await bcrypt.hash(password, 10);

    let newUser = new User({
      full_name,
      phone_number,
      email,
      role,
      password,
    });
    newUser = await newUser.save();
    const payload = {
      full_name: newUser.full_name,
      _id: newUser._id,
    }
    const token = getToken(payload);


    return { success: true, message: "Login successful", token, user: newUser };
  } catch (error) {
    return { success: false, message: `signup failed ${error}`, error };
  }
};

userSchema.statics.login = async function (email, password) {
  try {
    const User = this;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return { success: false, message: "User not found" };
    const payload = {
      full_name: user.full_name,
      _id: user._id,
    }
    if (!password) return { success: false, message: "Missing password" };

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return { success: false, message: "Invalid credentials" };
    delete user.password;
    const token = getToken(payload);
    return { success: true, message: "Login successful", token, user };
  } catch (error) {
    return { success: false, message: "Login failed", error };
  }
};

userSchema.statics.adminLogin = async function (email, password) {
  try {
    const User = this;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return { success: false, message: "Admin not found" };
    const payload = {
      full_name: user.full_name,
      _id: user._id,
    }
    if (user.role !== "admin")
      return { success: false, message: "Invalid credentials" };

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return { success: false, message: "Invalid credentials" };

    const token = getToken(payload);
    return { success: true, message: "Login successful", token, user };
  } catch (error) {
    return { success: false, message: "Login failed", error };
  }
};

userSchema.statics.changePassword = async function ({ email, password }) {
  try {
    const User = this;
    let user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: "Invalid email" };
    }
    const payload = {
      full_name: user.full_name,
      _id: user._id,
    }
    let encryptedPassword = await bcrypt.hash(password, 10);

    user.password = encryptedPassword;
    user = await user.save();
    const token = getToken(payload);
    return { success: true, message: "Login successful", token, user: user };
  } catch (error) {
    return { success: false, message: "Signup failed", error };
  }
};

export default mongoose.model("user", userSchema);
