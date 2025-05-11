import mongoose from "mongoose";
import User from "./user/user.js"
import { sendNotificationToUser } from "../controllers/notification.js"
import { getNotificationContent } from "../utils/functions.js"

function generateRandomOrderNumber() {
  const letters = String.fromCharCode(
    Math.floor(Math.random() * 26) + 65,
    Math.floor(Math.random() * 26) + 65
  );
  const numbers = Math.floor(1000 + Math.random() * 9000);
  return `${letters}${numbers}`;
}

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    products: [{ type: mongoose.Schema.Types.Mixed }],
    address: { type: String, required: true },
    payment_method: { type: String, required: true },
    sub_total: { type: Number, required: true },
    delivery: { type: Number, required: true },
    note: String,
    status: String,
    orderNumber: { type: String },
    //add Mohamad
    discount: { type: Number, required: true, },
    total: { type: Number, required: true, },
    totalQuantity: { type: Number, required: true, },
    status: { type: String, default: "pending" },

  },
  { collection: "order", timestamps: true }
);

orderSchema.pre("save", async function (next) {
  try {
    let uniqueOrderNumber = generateRandomOrderNumber();
    let isOrder = await mongoose.model("order").findOne({ orderNumber: uniqueOrderNumber });
    while (isOrder) {
      uniqueOrderNumber = generateRandomOrderNumber();
      isOrder = await mongoose.model("order").findOne({ orderNumber: uniqueOrderNumber });
    }
    this.orderNumber = uniqueOrderNumber;
    next();
  } catch (err) {
    next(err);
  }
});

orderSchema.post("save", async function () {
  try {
    const admins = await User.find({ role: { $eq: "admin" } })
    if (admins.length > 0) {
      for (let i = 0; i < admins.length; i++) {
        const adminDeviceToken = admins[i].deviceToken
        if (adminDeviceToken) {
          const { title, body } = getNotificationContent("order", null)
          const adminLang = admins[i].language
          await sendNotificationToUser(adminDeviceToken, title[adminLang].value, body[adminLang].value)
        }
      }
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
});

const Order = mongoose.model("order", orderSchema);

export default Order;



