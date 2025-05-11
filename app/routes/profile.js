import express from "express";

import HttpError from "./../utils/error/httpError.js";
import User from "../models/user/user.js";
import Product from "../models/product.js";
import { getAll, getOne, updateOne } from "../utils/crud/crud.factory.js";
const router = express.Router();

router.post("/favorite/:productId", async (req, res, next) => {
  const productId = req.params.productId;
  const favorite = req.query.favorite;
  const newUserData = req.user;
  try {
    await Product.findById(productId);
  } catch (_) {
    throw new HttpError("invalid product id", 400);
  }

  if (favorite === "true") {
    if (!newUserData.favorite_products.includes(productId))
      newUserData.favorite_products.push(productId);
  } else {
    newUserData.favorite_products = newUserData.favorite_products.filter(
      (e) => productId !== e
    );
  }
  await User.findOneAndUpdate({ _id: req.user._id }, newUserData);
  res
    .status(200)
    .json({
      status: "success",
      favorite_products: newUserData.favorite_products,
    });
});

router.get("/favorite/", async (req, res, next) => {
  const favoriteProducts = req.user.favorite_products;
  req.query = { _id: { $in: favoriteProducts } };
  req.query.populate = ["brand", "category"];
  getAll(Product)(req, res, next);
});

router.put("/", async (req, res, next) => {
  delete req.body.role;
  delete req.body.email;
  delete req.body.blocked;
  req.params.id = req.user._id; 
  updateOne(User)(req, res, next);
});

router.get("/", async (req, res, next) => {
  req.params.id = req.user._id;
  getOne(User)(req, res, next);
});
export default router;
