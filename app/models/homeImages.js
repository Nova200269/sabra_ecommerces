import mongoose from "mongoose";
import { saveAndSendNotification } from "../controllers/notificationSend.js";
import { getNotificationContent } from "../utils/functions.js"
import Brand from "../models/brand.js";
import Category from "../models/category.js";
import Product from "../models/product.js";

const homeImageSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    target_id: {
      type: String,
      validate: {
        validator: async function (v) {
          const targetType = this.parent().target_type;
          let collectionName = "";
          if (targetType === "product") collectionName = "product";
          else if (targetType === "category") collectionName = "category";
          else if (targetType === "brand") collectionName = "brand";
          try {
            const Model = mongoose.model(collectionName);
            const target = await Model.findById(v);
            if (!target) return false;
          } catch (_) {
            return false;
          }
        },
        message: (props) => `Invalid target_id`,
      },
    },
    target_type: { type: String, enum: ["product", "category", "brand"] },
  },
  { collection: "home_image", timestamps: true }
);


// Define the pre-save middleware
homeImageSchema.post('save', async function () {
  let { routName, title, body } = getNotificationContent(this.target_type, null);
  const goToId = this.target_id;
  const image = this.image;

  let target = await Brand.findById(goToId);
  if (!target) target = await Category.findById(goToId);
  if (!target) target = await Product.findById(goToId);

  if (target && target.name) {
    const nameMap = {};
    target.name.forEach(({ lang, value }) => {
      nameMap[lang] = value;
    });

    title = title.map(({ lang, value }) => ({
      lang,
      value: value.replace('{{name}}', nameMap[lang] || '')
    }));

    body = body.map(({ lang, value }) => ({
      lang,
      value: value.replace('{{name}}', nameMap[lang] || '')
    }));
  }

  try {
    await saveAndSendNotification(title, body, image, goToId, routName);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
});


export default mongoose.model("home_image", homeImageSchema);
