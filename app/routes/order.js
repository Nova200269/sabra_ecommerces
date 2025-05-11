import express from "express";
import Order from "../models/order.js";
import HttpError from "./../utils/error/httpError.js";
import Product from "../models/product.js";
import { createOne, getAll, updateOne } from "../utils/crud/crud.factory.js";
import { saveAndSendNotificationForOneUser } from "../controllers/notificationSend.js";
import User from "../models/user/user.js";
import { getNotificationContent } from "../utils/functions.js"

const router = express.Router();

router.post("/", (async (req, res, next) => {
  const { products } = req.body;
  for (let index = 0; index < products.length; index++) {
    const element = products[index];
    const productNew = await Product.findById(element._id);
    if (!productNew) {
      throw new HttpError("invalid products ids", 400);
    }
  }
  req.body.user = req.user._id;
  req.body.delivery = 0; //TODO: Find a way to calculate the delivery price.
  createOne(Order)(req, res, next);
})
);

router.get("/", async (req, res, next) => {
  req.query.populate = ["products", "user"]
  if (req.user.role === "admin") {
    getAll(Order)(req, res, next);
  } else {
    delete req.body;
    req.query["user"] = req.user._id;
    getAll(Order)(req, res, next);
  }
});

router.get("/:id", async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user');
  if (order) {
    res.status(200).json({
      status: "success",
      data: order,
    });
  } else {
    res.status(404).json({ message: "order not found" });
  }
});

router.post(
  "/status",
  async (req, res, next) => {
    const { order_id, status } = req.body;
    try {
      const order = await Order.findById(order_id).populate('user');
      if (!order) {
        throw new HttpError("Invalid order ID", 400);
      }
      if (order.status !== "pending") {
        throw new HttpError("Can't change the status of this order", 400);
      }
      const user = await User.findById(order.user);
      if (!user) {
        throw new HttpError("Invalid user ID", 400);
      }
      if (req.user.role === "admin" || req.user._id.equals(order.user._id)) {
        await order.updateOne({ status: status });
        const updatedOrder = await Order.findById(order_id);
        res.status(200).json({
          status: "success",
          data: updatedOrder,
        });
        if (user.deviceToken) {
          try {
            const { routName, title, body } = getNotificationContent(null, status);
            const goToId = order_id;
            const image = undefined;
            await saveAndSendNotificationForOneUser(title, body, image, goToId, routName, user.deviceToken, user.id);
          } catch (notificationError) {
            console.error('Notification Error:', notificationError);
          }
        }
      } else {
        next(new HttpError("You do not have permissions", 400));
      }
    } catch (error) {
      next(error);
    }
  }
);

router.put("/:id", async (req, res, next) => {
  const isOrder = await Order.findById(req.params.id)
  if (!isOrder) {
    throw new HttpError("can't find order with that id", 400);
  }
  updateOne(Order)(req, res, next);
})

router.delete("/:id", async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id)
  if (order) {
    res.status(200).json({
      status: "success",
      message: "order has been deleted"
    })
  } else {
    res.status(404).json({
      status: "error",
      message: "order is not found"
    })
  }
})

export default router;