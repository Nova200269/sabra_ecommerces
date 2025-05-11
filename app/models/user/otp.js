import mongoose from "mongoose";
import validator from "validator";
import HttpError from "../../utils/error/httpError.js";
import { generateOTP } from "../../utils/functions.js";
import { sendEmail } from "../../utils/service/email.js";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator: function (email) {
          return validator.isEmail(email);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    code: { type: String, default: "1234" }, //TODO: FIX ME: ONLY FOR TESTING. generateOTP().toString()
    attempt: { type: Number, default: 1 },
    expire_date: {
      type: Date,
      default: () => Date.now() + 1000 * 60 * 5,
    },
  },
  { collection: "otp", timestamps: true }
);

otpSchema.pre("save", async function (next) {
  try {
    sendEmail(
      this.email,
      "Verify Your Account with This OTP",
      `Dear User,\n To complete your account verification, please use the following OTP code:\n
      ${this.code}
      \nThis code is valid for a limited time, so please enter it as soon as possible.\nIf you did not request this verification, please disregard this email.`
    ).then();
  } catch (error) {
    next(error);
  }
});

otpSchema.statics.verifyOtp = async function (email, code) {
  try {
    const Otp = this;
    const otp = await Otp.findOne({ email, code });

    if (!otp)
      return { success: false, message: "Invalid otp for this phone number" };

    return { success: true, message: "Validation success", token, user };
  } catch (error) {
    return { success: false, message: "Validation failed", error };
  }
};

export default mongoose.model("otp", otpSchema);
