import express from "express";
import { getAllGuest } from "../controllers/guest.js";
import authentication from "./../utils/middleware/authentication.js";

const router = express.Router();

router.route("/").get(authentication, getAllGuest)

export default router;