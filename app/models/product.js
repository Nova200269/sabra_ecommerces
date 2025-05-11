import mongoose from "mongoose";
import translate from "./utils/translate.js";
import Order from "./order.js";
import Category from "./category.js";
import { createSlug, extractKeywords } from "./../utils/functions.js";
import HttpError from "../utils/error/httpError.js";
import crypto from "crypto";
import { createOrUpdateProp } from "./../utils/functions.js";
import Prop from "./../models/prop.js";
import Brand from "./brand.js";


const prop = {
  key: translate,
  _id: { type: mongoose.Schema.Types.ObjectId, required: false },
  type: {
    type: String,
    required: true,
    default: "choice",
    enum: ["choice", "input"],
  },
  values: [
    {
      value: translate,
      _id: mongoose.Schema.Types.ObjectId,
      over_price: Number,
      images: [String],
      isSelected: { type: Boolean, default: false }
    },

  ],
  isCategoryProp: { type: Boolean, default: false },
};

const productSchema = new mongoose.Schema(
  {
    name: { type: translate, required: true },
    price: { type: Number, required: true },
    images: { type: mongoose.Schema.Types.Array, required: true },
    dec: translate,
    discount: Number,
    average_rate: { type: Number, default: 0 },
    rate_number: { type: Number, default: 0 },
    out_of_stack: { type: Boolean, default: false },
    viewed: { type: Number, default: 0 },
    available_after: String,
    key_words: { type: String, select: true },
    search_key_words: { type: String, select: false },
    new_key_words: { type: [String], select: true, default: [] },
    new_search_key_words: { type: [String], select: false, default: [] },
    slug: { type: String },
    props: [prop],
    categories_path: mongoose.Schema.Types.Array,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "brand",
      required: true,
    },
  },
  { collection: "product", timestamps: true }
);
productSchema.virtual("prop_key_have_image").get(function () {
  let prop_key = null;
  const props = this.props;
  for (const prop of props) {
    if (prop.values.some((e) => e?.images?.length > 0)) {
      prop_key = prop.key;
      break;
    }
  }
  return prop_key;
});
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.pre("save", async function (next) {
  // const validProps = validateProps(this.props);
  // if (!validProps) next("Only one prop choice must have image");
  try {
    await createKeyWords(this);
    await setSlug(this);
    await changeFirstValuePropToTrue(this);
    this.discount = this.discount == 0 ? null : this.discount;
    // await saveOrUpdatePoroductProp(this);
    next();
  } catch (error) {
    next(error);
  }
  // console.log(this.slug);
  next();
});
productSchema.pre(/^find/, function (next) {
  this.populate("category");
  this.populate("brand");
  next();
});
// productSchema.pre("findOne", async function () {
//   try {
//     const id = this.getQuery()._id;
//     console.log('=======1=========');
//     console.log(id);

//     // const update = { $inc: { viewed: 1 } };

//    var result = await Product.findOne({ _id: id });
//     console.log('=====2===========');
//     console.log(result);
//   } catch (err) {}
// });
productSchema.post("findOne", async function () {
  try {

    const Product = mongoose.model("product", productSchema);
    const id = this.getQuery()._id;
    const update = { $inc: { viewed: 1 } };

    await Product.findOneAndUpdate({ _id: id }, update, { new: true });
  } catch (err) { }
});

productSchema.pre("findOneAndDelete", async function (next) {
  try {
    const id = this.getQuery()._id;
    const usedInOrders = await Order.exists({ products: id });
    if (usedInOrders) {
      next(new Error("Cannot delete product.it is used in an order"));
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});

async function createKeyWords(product) {
  const categoryData = await Category.findById(product.category);
  if (!categoryData) throw new HttpError("Invalid category id", 400)
  const categoryName = categoryData ? categoryData.name : "";
  //add By mohamad for search brand name
  const brandData = await Brand.findById(product.brand);
  if (!brandData) throw new HttpError("Invalid Brand id", 400)
  const brandName = brandData ? brandData.name : "";
  const propsSlug = product.props
    .map((prop) => prop?.values?.map((e) => e.value.map((t) => t.value)))
    .join(" ");
  const userKeyWords = createSlug(product.key_words);
  product.search_key_words =
    product.name.map((e) => `${e.value} `) +
    " " +
    product.price +
    " " +
    product.dec.map((e) => e.value) +
    " " +
    categoryName.map((e) => `${e.value} `) +
    " " +
    brandName.map((e) => `${e.value} `) +
    " " +
    propsSlug +
    " " +
    userKeyWords;
  product.search_key_words = product.search_key_words?.toLowerCase()?.replace(",", " ");

  const newPropsSlug = product.props
    .map((prop) => prop?.values?.map((e) => e.value.map((t) => t.value)).flat())
    .flat()
    .join(" ");

  const newUserKeyWords = extractKeywords(product.key_words);
  product.new_key_words = newUserKeyWords;
  const allKeywords = [
    ...product.name.map((e) => e.value?.toLowerCase()),
    product.price?.toString(),
    ...product.dec.map((e) => e.value?.toLowerCase()),
    ...categoryName.map((e) => e.value?.toLowerCase()),
    ...brandName.map((e) => e.value?.toLowerCase()),
    ...extractKeywords(newPropsSlug),
    ...newUserKeyWords,
  ];
  const originalKeywords = allKeywords.filter(Boolean);
  product.new_search_key_words = originalKeywords.map(w => w.toLowerCase());
}

async function setSlug(product) {
  let slug = createSlug(product.slug);
  const Product = mongoose.model("product", productSchema);
  const resultSlug = await Product.find({ slug: { $eq: slug } });
  //find any product == same slug
  if (resultSlug.length == 0) {
  } else {
    if (product.id == resultSlug[0].id) {
    }
    else {
      slug = slug + "-" + crypto.randomInt(0, 10000);
      //find any product == same slug after changed
      const resultSlug2 = await Product.find({ slug: { $eq: slug } });
      if (resultSlug2.length == 0) {
      } else {
        slug = slug + crypto.randomInt(55, 957);
      }
    }
  }
  product.slug = slug;
}


//add Mohamad change first isSelected in prop
async function changeFirstValuePropToTrue(product) {
  let listProductProp = [];
  listProductProp = product.props;
  if (listProductProp.length > 0) {
    for (const value of product.props) {
      let listProductPropValues = [];
      listProductPropValues = value.values;
      if (listProductPropValues.length > 0) {
        listProductPropValues[0].isSelected = true;
      }
    }
  }
}

// async function saveOrUpdatePoroductProp(product) {
//     let props = product.props;
//     for (let index = 0; index < props.length; index++) {
//       const element = props[index];

//       //====================
//      if(!element.isCategoryProp){
//       if (element._id) {
//         await Prop.findOneAndUpdate({ _id: element._id }, element);
//       } else {
//         //add new prop
//         const newProp = await Prop.create(element);
//         element._id = newProp._id;
//       }
//      }
//     }
//     // props = await createOrUpdateProp(props);
//     // product.props = props?.map((e) => e._id) ?? [];
// }

function validateProps(props) {
  let propsWitImages = 0;
  for (var prop of props) {
    for (const value of prop.values) {
      if (value.images.length > 0) {
        propsWitImages++;
        break;
      }
    }
  }
  return propsWitImages === 1;
}
productSchema.index({ name: "text", content: "text" });

export default mongoose.model("product", productSchema);
