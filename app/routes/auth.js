import express from "express";
import authentication from "../utils/middleware/authentication.js";
import Otp from "../models/user/otp.js";
import {
  signup,
  generateOtp,
  regenerateOTP,
  login,
  adminSignup,
  adminLogin,
  forgetPassword,
  changePasswordUser,
  deleteUser
} from "./../controllers/auth.js";

const router = express.Router();

router.get("/number", async function (req, res) {
  return res.status(200).json({
    "status": "success",
    "phoneNumber": `${process.env.NUMBER}`,
    "shareLink": `${process.env.LINK}`
  });
});

router.post("/number", async function (req, res) {
  let number
  let link
  if (req.query.number) {
    number = "+" + req.query.number.replace(/\s/g, "");
    process.env.NUMBER = number
  }
  if (req.query.link) {
    link = req.query.link.replace(/\s/g, "");
    process.env.LINK = link
  }
  number = process.env.NUMBER
  link = process.env.LINK
  return res.status(200).json({
    "status": "success",
    "phoneNumber": `${number}`,
    "shareLink": `${link}`
  });
});

router.get("/otp", async function (req, res) {
  const otps = await Otp.find().sort({ createdAt: -1 })
  const count = otps.length === 0 ? 0 : await Otp.countDocuments();
  return res.status(200).json({
    status: "success",
    count: otps.length,
    result: otps,
    total_count: count
  });
});

router.post("/login", login);
router.post("/signup", signup);
router.post("/generate-otp", generateOtp);
router.post("/regenerate-otp", regenerateOTP);
router.post("/forget-password", forgetPassword);

router.post("/admin-login", adminLogin);
router.post("/admin-signup", adminSignup);
//add by Mohamad
// router.use(authentication);
router.delete("/delete-user", deleteUser)
router.post("/change-Password", changePasswordUser);





export default router;
