import HttpError from "./../utils/error/httpError.js";
import User from "../models/user/user.js";
import Order from "../models/order.js";
import Review from "../models/review.js";
import NotificationSend from "../models/notificationSend.js";
import Otp from "../models/user/otp.js";
import bcrypt from "bcrypt";
import { generateOTP } from "./../utils/functions.js";
import { saveAndSendNotificationForOneUser } from "../controllers/notificationSend.js";
import { getNotificationContent } from "../utils/functions.js"

function generateRandomPassword() {
  const uppercase = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
  const number = String.fromCharCode(Math.floor(Math.random() * 10) + 48);
  const symbols = "!@#$%^&*()_+{}[]<>";
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const otherCharacters = Math.random().toString(36).slice(-5);
  const password = (uppercase + number + symbol + otherCharacters)
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
  return password;
}

export async function generateOtp(req, res) {
  const { email } = req.body;
  const checkEmail = await User.findOne({ email });
  if (checkEmail) throw new HttpError("Email already exists", 400);
  const oldOtp = await Otp.findOne({ email });
  if (oldOtp && oldOtp.expire_date > Date.now()) {
    if (oldOtp?.attempt === 4) {
      throw new HttpError("try after 24h", 400);
    }
    oldOtp.attempt = oldOtp.attempt + 1;
    oldOtp.code = generateOTP();
    await oldOtp.save();
    res.json({ status: "success", expire_date: oldOtp.expire_date });
    return
  }
  if (oldOtp && oldOtp.expire_date < Date.now())
    await oldOtp.deleteOne();
  const otpCode = generateOTP();
  const otp = new Otp(
    {
      email: req.body.email,
      code: otpCode
    }
  )
  await otp.save()
  res.json({ status: "success", expire_date: otp.expire_date });
}

export async function regenerateOTP(req, res, next) {
  const { email } = req.body;
  const oldOtp = await Otp.findOne({ email });
  if (oldOtp && oldOtp.expire_date < Date.now()) {
    await oldOtp.deleteOne();
    throw new HttpError("OTP expired. Please generate a new one.", 400);
  }
  if (!oldOtp) {
    const otpCode = generateOTP();
    const otp = new Otp(
      {
        email: req.body.email,
        code: otpCode
      }
    )
    await otp.save()
    res.json({ status: "success" });
    return;
  }
  if (oldOtp?.attempt === 4) {
    next(new HttpError("try after 24h", 400));
    return;
  }
  if (oldOtp) {
    oldOtp.attempt = oldOtp.attempt + 1;
    oldOtp.code = generateOTP();
    await oldOtp.save();
    res.json({ status: "success" });
  }
}

export async function signup(req, res) {
  const otp = await Otp.findOne({
    code: req.body.otp,
    email: req.body.email,
  });
  if (!otp) {
    res.status(400).json({ message: "invalid otp" });
    return;
  }
  await Otp.deleteOne({ _id: otp._id });
  delete req.body.role;
  const response = await User.signup(req.body);
  if (response.success) {
    // const { full_name, _id, deviceToken } = response.user;
    // let { title, body } = getNotificationContent('wellcome', null);
    // const nameMap = {
    //   eng: full_name,
    //   ar: full_name
    // };
    // title = title.map(({ lang, value }) => ({
    //   lang,
    //   value: value.replace('{{name}}', nameMap[lang] || full_name)
    // }));
    // body = body.map(({ lang, value }) => ({
    //   lang,
    //   value: value.replace('{{name}}', nameMap[lang] || full_name)
    // }));
    // await saveAndSendNotificationForOneUser(title, body, "image", null, null, deviceToken, _id);
    res.json(response);
  }
  else res.status(400).json(response);
}

export async function login(req, res) {
  const response = await User.login(req.body.email, req.body.password);
  if (response.success) {
    // const { full_name, _id, deviceToken } = response.user;
    // let { title, body } = getNotificationContent('welcome_back', null);
    // const nameMap = {
    //   eng: full_name,
    //   ar: full_name
    // };
    // title = title.map(({ lang, value }) => ({
    //   lang,
    //   value: value.replace('{{name}}', nameMap[lang] || full_name)
    // }));
    // body = body.map(({ lang, value }) => ({
    //   lang,
    //   value: value.replace('{{name}}', nameMap[lang] || full_name)
    // }));
    // await saveAndSendNotificationForOneUser(title, body, "image", null, null, deviceToken, _id);
    res.json(response);
  }
  else res.status(400).json(response);
}

export async function forgetPassword(req, res, next) {

  const { email, otp, password } = req.body;
  const oldOtp = await Otp.findOne({ email, code: otp });
  if (!oldOtp) {
    next(new HttpError("Invalid otp", 400));
    return;
  }
  res.json(await User.changePassword({ email, password }));
}
//**** add Mohamad *****/
export async function changePasswordUser(req, res, next) {
  const { newPassword, oldPassword } = req.body;
  // req.body.user = req.user._id;
  if (newPassword == null || oldPassword == null) {
    next(new HttpError("password is missing", 400));
    return;
  }
  const findUser = await User.findOne({ _id: req.user._id });
  const email = req.user.email
  if (!findUser) {
    next(new HttpError("no user Found", 400));
    return;
  }
  const userLogInTest = await User.login(email, oldPassword);
  if (userLogInTest.success) {
    const password = newPassword;
    res.json(await User.changePassword({ email, password }));
  } else {
    next(new HttpError("your old password is incorrect", 400));
    return;
  }


  // res.json(await User.changePassword({ email, password }));
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
    await Order.deleteMany({ user: user._id });
    await NotificationSend.deleteMany({ user: user._id });
    await Review.deleteMany({ user: user._id });

    user.favorite_products = [];
    user.saved_address = [];
    user.deviceToken = "";
    user.role = "client";
    user.image = "";
    user.blocked = true;

    let randomName = `user_${Math.random().toString(36).substr(2, 9)}`;
    const nameUser = await User.findOne({ full_name: randomName });
    if (nameUser) {
      randomName = `user_${Math.random().toString(36).substr(2, 9)}`;
    }
    user.full_name = randomName;
    let randomEmail = `${Math.random().toString(36).substring(2, 15)}@example.com`;
    const emailUser = await User.findOne({ email: randomEmail });
    if (emailUser) {
      randomEmail = `${Math.random().toString(36).substring(2, 15)}@example.com`;
    }
    user.email = randomEmail;
    const randomPassword = generateRandomPassword();
    user.password = await bcrypt.hash(randomPassword, 10);
    await user.save();
    await User.findByIdAndDelete(user._id);
    res.status(200).json({
      status: "success",
      message: "User has been deleted"
    });
  } catch (error) {
    next(new HttpError("Failed to delete user", 500));
  }
}


//****Admin*****/

export async function adminLogin(req, res) {
  const response = await User.adminLogin(req.body.email, req.body.password);
  if (response.success) res.json(response);
  else res.status(400).json(response);
}
export async function adminSignup(req, res) {
  req.body.role = "admin";
  const response = await User.signup(req.body);
  if (response.success) res.json(response);
  else res.status(400).json(response);
}

export const deleteOtp = async () => {
  console.log("RUN DELETE EXPIRED OTP");
  const now = new Date();
  await Otp.deleteMany({
    expire_date: { $lte: now },
  });
  return;
};
