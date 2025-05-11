import mongoose from "mongoose";

import Product from "./product.js";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    dec: String,
    rate: Number,
  },
  { collection: "review", timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.pre("save", async function (next) {
  try {
    const existingReview = await this.constructor.findOne({
      product: this.product,
      user: this.user,
    });

    if (existingReview) {
      const err = new Error("User has already rated this product.");
      next(err);
    }

    const product = await Product.findById(this.product);
    if (!product) {
      const err = new Error("Invalid product Id");
      next(err);
    }
    const oldAverageRate = product.average_rate;
    const oldRateNumber = product.rate_number;
    const newAverageRate =
      (oldAverageRate * oldRateNumber + +this.rate) / (oldRateNumber + 1);
    product.average_rate = newAverageRate;
    product.rate_number = oldRateNumber + 1;
    await product.save(product.id);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("review", reviewSchema);
