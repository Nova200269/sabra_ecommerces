import express from "express";
import mongoose from "mongoose";

import HomeImages from "../models/homeImages.js";
import crudRoutes from "../utils/crud/crud.router.js";
import { admin } from "../utils/middleware/authorization.js";
import authentication from "../utils/middleware/authentication.js";
import APIFeatures from "../utils/crud/apiFeatures.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const features = new APIFeatures(HomeImages, req.query)
    .filter()
    .sort()
    .limitFields()
    .populate()
    .paginate();

  const images = await features.query;
  const countFeatures = new APIFeatures(HomeImages, req.query).filter().count();
  const count = await countFeatures.query;

  const docs = [];
  for (const image of images) {
    let collectionName = "";

    if (image.target_type === "product") collectionName = "product";
    else if (image.target_type === "category") collectionName = "category";
    else if (image.target_type === "brand") collectionName = "brand";

    try {
      let newModel = { ...image.toObject() };
      const Model = mongoose.model(collectionName);
      newModel.target = await Model.findById(image.target_id);
      docs.push(newModel);
    } catch (_) {}
  }

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: docs.length,
    data: docs,
    total_count: count,
  });
});

router.get("/:id", async (req, res, next) => {
  const image = await HomeImages.findById(req.params.id);

  if (!image) return next(new Error("No document found with that Id"));
  let collectionName = "";
  if (image.target_type === "product") collectionName = "product";
  else if (image.target_type === "category") collectionName = "category";
  else if (image.target_type === "brand") collectionName = "brand";

  let newModel = { ...image.toObject() };
  try {
    const Model = mongoose.model(collectionName);
    newModel.target = await Model.findById(image.target_id);
  } catch (_) {}
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    data: newModel,
  });
});

router.use(
  crudRoutes({
    className: HomeImages,
    otherRouter: router,
    setAuth: authentication,
    setRole: admin,
  })
);

export default router;
