import express from "express";

import crudRoutes from "../utils/crud/crud.router.js";
import { admin } from "../utils/middleware/authorization.js";

import brand from "../models/brand.js";
import review from "../models/review.js";
import product from "../models/product.js";
import user from "../models/user/user.js";
import notification from "../models/notification.js";
import authentication from "./../utils/middleware/authentication.js";

const router = express.Router();

router.use(
  "/brands",
  crudRoutes({ className: brand, setAuth: authentication, setRole: admin })
);
router.use(
  "/users",
  crudRoutes({
    className: user,
    setAuth: authentication,
    getAuth: authentication,
    setRole: admin,
    getRole: admin,
  })
);
router.use(
  "/notifications",
  crudRoutes({
    className: notification,
    getAuth: authentication,
    setAuth: authentication,
    setRole: admin,
  })
);


router.use(
  "/product",
  (req, _, next) => {
    if (req.query.name) {
      req.query.name = {
        $elemMatch: { value: { $regex: req.query.name, $options: "i" } },
      };
    }
    next();
  },
  crudRoutes({ className: product, setAuth: authentication, setRole: admin })
);

// router.use(authentication)   //Deleted for get review without token
router.use(
  "/review",
  (req, res, next) => {
    if (req.user) {
      req.body.user = req.user._id;
    }
    req.query.populate = "user";
    next();
  },
  crudRoutes({ className: review, setAuth: authentication })
);
export default router;
