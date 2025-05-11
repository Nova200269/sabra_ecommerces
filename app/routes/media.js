import express from "express";

import authentication from "../utils/middleware/authentication.js";
import { admin } from "../utils/middleware/authorization.js";
import {
  uploadIcon,
  uploadImage,
  uploadVideo,
} from "../controllers/media/upload.js";

import { verifyImage, verifyVideo } from "../controllers/media/verify.js";

const router = express.Router();
///UPLOAD MEDIA
/**
 * UPLOAD IMAGE PROCESSING:
 * 1- Upload image using /upload-image api
 * 2- When assign this image with an object change the image file name to contain an index "for example"
 * 3- Run a cron task every day to delete all images with no index
 */
router.use(authentication);

router.post(
  "/upload-image",
  (async (req, res) => {
    let url = "";
    if (req.body.icon) url = await uploadIcon(req.files.image);
    else url = await uploadImage(req.files.image);
    res.status(200).json({ url });
  })
);

router.post(
  "/upload-video",
  (async (req, res) => {
    res.status(200).json({ url: await uploadVideo(req.files.video) });
  })
);

///VERIFY MEDIA
router.use(admin);
router.post(
  "/verify-image",
  (async (req, res) => {
    await verifyImage(req.body.image_url);
    res.send();
  })
);
router.post(
  "/verify-video",
  (async (req, res) => {
    await verifyVideo(req.body.video_url);
    res.send();
  })
);

export default router;
