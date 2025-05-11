import express from "express";
import {
    getUnreadNotification,
    getAllNotification,
    createNewNotification,
    getUnreadNotificationGuest,
    getUnreadNotificationUser,
    getAllNotificationGuest,
    deleteAllNotification,
    deleteNotificationById
} from "../controllers/notificationSend.js";

import authentication from "./../utils/middleware/authentication.js";

const router = express.Router();

router.route("/").get(authentication, getAllNotification)
    .post(authentication, createNewNotification)
    .delete(authentication, deleteAllNotification);
router.route("/delete").delete(authentication, deleteNotificationById);
router.route("/guest-notification").get(getAllNotificationGuest);
router.route("/unread-notification-guest").post(getUnreadNotificationGuest);
router.route("/unread-notification-user").get(authentication, getUnreadNotificationUser);

// to keep the versions from 1.0.7 running with old way
router.route("/unread-notification").get(authentication, getUnreadNotification);

export default router;