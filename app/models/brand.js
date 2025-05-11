import mongoose from "mongoose";
import translate from "./utils/translate.js";
import Product from "./product.js";
import Category from "./category.js";

const brandSchema = new mongoose.Schema(
  {
    name: { type: translate, required: true },
    image: { type: String, required: true },
  },
  { collection: "brand", timestamps: true }
);

brandSchema.pre("findOneAndDelete", async function (next) {
  try {
    const id = this.getQuery()._id;
    const usedInProduct = await Product.exists({ brand: id });

    const usedInCategory = await Category.findOne({ brands: { $in: [id] } });
    if (usedInProduct || usedInCategory) {
      const error = new Error("Cannot delete brand. it is used in a product or a category");
      next(error);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});
export default mongoose.model("brand", brandSchema);
