import express from "express";

import HttpError from "./../utils/error/httpError.js";
import Product from "../models/product.js";
import Authentication from "../utils/middleware/authentication.js";
const router = express.Router();

router.get("/discounted-products", async (req, res, next) => {
  const products = await Product.find({ discount: {$gt: 0}}).sort({ createdAt: -1 }).limit(6);
  res.json({ "discounted-products": products });
});

router.get("/most-recent-products", async (req, res, next) => {
  const products = await Product.find().sort({ createdAt: -1 }).limit(6);
  res.json({ "recent-products": products });
});

router.get("/most-popular-products", async (req, res, next) => {
  const products = await Product.find().sort({ viewed: -1 }).limit(6);
  res.json({ "popular-products": products });
});

router.post("/recommended-products", async (req, res, next) => {
  Authentication(req, res, async (error) => {
    try {
      let recommendedProducts = [];
      let userProduct = [];
      if (!error) {
        userProduct = req.user.favorite_products;
        if (userProduct.length < 1) {
          res.json({ "recommended-products": await Product.find().limit(5) });
        }
      } else {
        userProduct = req.body.old_navigated_prod;
      }
      userProduct = await Product.find({ _id: { $in: userProduct } });
      userProduct = userProduct.filter((e) => e?.category);
      const category = userProduct.map((e) => e?.category?._id);
      const countOccurrences = category.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {});
      let sortedCategories = Object.keys(countOccurrences).sort((a, b) => countOccurrences[b] - countOccurrences[a]);
      sortedCategories = sortedCategories.slice(0, 5);
      recommendedProducts = await Product.find({
        category: { $in: sortedCategories },
      });
      res.json({ "recommended-products": recommendedProducts });
    } catch (e) {
      next(new HttpError("Some thing get wrong!",500));
    }
  });
});
export default router;
