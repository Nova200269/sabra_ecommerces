import express from "express";

import auth from "./auth.js";
import home from "./home.js";
import category from "./category.js";
import media from "./media.js";
import profile from "./profile.js";
import order from "./order.js";
import homeImage from "./homeImage.js";
import search from "./search.js";
import analysis from "./analysis.js";
import crudRoutes from "./crudRouters.js";
import authentication from "../utils/middleware/authentication.js";
import review from "./review.js";
import newVersion from "./newVersion.js";
import notifationSend from "./notificationSend.js";
import storeToken from "./store-token.js";
import currency from "./currency.js";
import guest from "./guest.js";
import deleteDatabase from "./deleteDatabase.js"







const router = express.Router();
router.use("/auth", auth);
router.use("/media", media);
router.use("/newversion", newVersion);
router.use("/notification-send", notifationSend);
router.use("/store-token", storeToken);
router.use("/currency", currency);


router.use("/home", home);
router.use("/search", search);
router.use("/category", category);
router.use("/home-images", homeImage);
router.use("/guest", guest);

//Add By Mohamad 
router.use("/review", review);
router.use(crudRoutes);
// router.use(authentication);
router.use("/analysis", analysis);
router.use("/profile", profile);
router.use("/order", order);
router.use("/deletedatabase", deleteDatabase);


export default router;
