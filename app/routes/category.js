import express from "express";

import Category from "./../models/category.js";
import auth from "./../utils/middleware/authentication.js";
import { admin } from "./../utils/middleware/authorization.js";
import crudRoutes from "./../utils/crud/crud.router.js";
import { getChildren, getProps } from "../controllers/category.js";

const router = express.Router();

router.use((req, _, next) => {
  req.query.populate = ["parent_category", { path: "props", model: "prop" }, { path: "brands", model: "brand" }];
  next();
});
router.get("/children/:id", getChildren);
router.get("/property/:id", getProps);

router.use((req, _, next) => {
  if (req.query.parent === "true") {
    req.query.parent_category = { $exists: false, $eq: null };
  }
  delete req.query.parent;
  next();
}, crudRoutes({ className: Category, otherRouter: router, setAuth: auth, setRole: admin }));

export default router;
