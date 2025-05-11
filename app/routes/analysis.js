import express from "express";

import Order from "../models/order.js";
import Product from "../models/product.js";
import User from "../models/user/user.js";
import Brand from "../models/brand.js";
const router = express.Router();

router.get(
  "/total-numbers",
  (async (req, res, next) => {
    res.json({
      total_orders: await Order.count(),
      total_products: await Product.count(),
      total_users: await User.count(),
      total_brands: await Brand.count(),
    });
  })
);

router.get(
  "/category-product-count",
  (async (req, res, next) => {
    const response = await Product.aggregate([
      {
        $lookup: {
          from: "category",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category", // Unwind the array of categories
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id.name",
          count: "$count",
        },
      },
    ]);
    res.json({ response });
  })
);
router.get(
  "/last-added",
  (async (req, res) => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    res.json({
      new_users: await User.count({
        createdAt: { $gte: lastMonth },
      }),
      new_orders: await Order.count({ createdAt: { $gte: lastMonth } }),
    });
  })
);

router.get(
  "/brand-product-count",
  (async (req, res, next) => {
    const response = await Product.aggregate([
      {
        $lookup: {
          from: "brand",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $unwind: "$brand", // Unwind the array of categories
      },
      {
        $group: {
          _id: "$brand",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id.name",
          count: "$count",
        },
      },
    ]);
    res.json({ response });
  })
);
export default router;
