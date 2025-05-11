import mongoose from "mongoose";
import translate from "./utils/translate.js";
import Product from "./product.js";

const choices = [{ value: translate, over_price: Number, images: [String] }];

const propSchema = new mongoose.Schema(
  {
    key: translate,
    values: choices,
    type: { type: String, enum: ["choice", "input"], required: true },
    required: { type: Boolean, default: false },
    isCategoryProp: { type: Boolean, default: true },
  },
  { collection: "prop", timestamps: true }
);

propSchema.post("findOneAndUpdate", async function (next) {
  try {
    const Prop = mongoose.model("prop", propSchema);
    const id = this.getQuery()._id;
    const newProp = await Prop.findById(id);
    const productsNeedToUpdate = await Product.find({ "props.prop_id": id });
    for (const product of productsNeedToUpdate) {
      const propIndex = product.props.findIndex(
        (e) => e.prop_id.toString() === id.toString()
      );
      if (propIndex > -1) {
        const updateProp = product.props[propIndex];
        updateProp.key = newProp.key;
        const neededValues = newProp.values?.filter(
          (e) => updateProp?.values?.indexOf((t) => t._id === e._id) !== -1
        );

        updateProp.values = neededValues;
        product.props[propIndex] = updateProp;
        await product.save();
      }
    }
  } catch (err) {
    console.log(err);
  }
});

export default mongoose.model("prop", propSchema);
