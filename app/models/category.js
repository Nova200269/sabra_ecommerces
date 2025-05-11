import mongoose from "mongoose";
import translate from "./utils/translate.js";
import Product from "./product.js";
import { createOrUpdateProp } from "./../utils/functions.js";
import Brand from "../models/brand.js"

const categorySchema = new mongoose.Schema(
  {
    name: { type: translate, required: true },
    cover_image: { type: String, required: true },
    parent_category: { type: mongoose.Schema.Types.ObjectId, ref: "category" },
    props: mongoose.Schema.Types.Array,
    brands: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "brand",
    },
    sortByDate: { type: Date },
  },
  { collection: "category", timestamps: true }
);

categorySchema.pre("findOneAndDelete", async function (next) {
  try {
    const Category = mongoose.model("category", categorySchema);
    const id = this.getQuery()._id;

    const hasChildren = await Category.exists({ parent_category: id });
    const usedInProduct = await Product.exists({ category: id });

    if (hasChildren || usedInProduct) {
      const error = new Error(
        "Cannot delete category with children or used in a product"
      );
      next(error);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});

categorySchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      this.sortByDate = this.createdAt;
    }

    let props = this.props;
    props = await createOrUpdateProp(props);
    this.props = props?.map((e) => e._id) ?? [];
    const brands = this.brands
    for (let i = 0; i < brands.length; i++) {
      const checkBrand = await Brand.findById(brands[i])
      if (!checkBrand) {
        const error = new Error(
          "brand is not found"
        );
        next(error);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});
export default mongoose.model("category", categorySchema);
