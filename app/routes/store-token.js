import express from "express";
import authentication from "./../utils/middleware/authentication.js";
import { createNewFCMFromMobile } from "../controllers/store-token.js";




const router = express.Router();
router.route("/").post(createNewFCMFromMobile);

export default router;