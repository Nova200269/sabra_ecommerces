import express from "express";

import HttpError from "./../utils/error/httpError.js";
import Product from "../models/product.js";
import { getAll } from "../utils/crud/crud.factory.js";
import Category from "../models/category.js";
const router = express.Router();

router.get("/by-filter/", async (req, res, next) => {
  const { minPrice, maxPrice, category, brand, name, minRate, discount, sort, ...rest } = req.query;
  const query = {};
  if (minPrice && maxPrice) query["price"] = { gte: +minPrice, lte: +maxPrice };
  if (minPrice && !maxPrice) query["price"] = { gte: +minPrice };
  if (maxPrice && !minPrice) query["price"] = { lte: +maxPrice };
  if (brand) query["brand"] = brand;
  if (minRate) query["average_rate"] = { gte: +minRate };
  if (discount === "true") query["discount"] = { gte: 1 };
  if (name) {
    const keywords = name
      .toLowerCase()
      .split(" ")
      .map(word => word.trim())
      .filter(Boolean);
    if (keywords.length > 0) {
      query["$or"] = keywords.map(word => ({
        new_search_key_words: { $regex: word, $options: "i" }
      }));
    }
  }

  if (category) {
    const children = [];
    await getAllCategoryChildren(category, children);
    children.push(category);
    query["category"] = { $in: children };
  }
  // Apply the new sorting format
  let sortObj = {};
  if (sort) {
    try {
      sortObj = JSON.parse(sort); // Parse the sort object sent by the frontend
    } catch (error) {
      return next(new HttpError("Invalid sort value", 400));
    }
  }
  req.query = { ...rest, ...query, sort: sortObj };
  req.query.populate = ["brand", "category"];
  getAll(Product)(req, res, next);
});

async function getAllCategoryChildren(categoryId, childrenList) {
  const children = await Category.find({ parent_category: categoryId });
  childrenList.push(...children);
  for (const child of children) {
    if (child.parent_category !== null) {
      await getAllCategoryChildren(child._id, childrenList);
    }
  }
}

router.get("/related-product/:id", async (req, res, next) => {
  const productId = req.params.id;
  const productCategoryId = (await Product.findById(productId))?.category;
  if (!productCategoryId) next(new HttpError("Invalid product id !", 400));
  const products = await Product.find({
    category: productCategoryId,
    _id: { $ne: productId },
  }).limit(6);
  res.json({ status: "success", results: products.length, data: products });
});

export default router;
