import express from "express";
import { createOne, getAll } from "../utils/crud/crud.factory.js";
import review from "../models/review.js";
import HttpError from "./../utils/error/httpError.js";
const router = express.Router();
import authentication from "./../utils/middleware/authentication.js";
import crudRoutes from "../utils/crud/crud.router.js";
import Crud from "../utils/crud/crud.controller.js";
import {postReview} from "../controllers/review.js";
//Add By Mohamad 
router
    .route("/")
    .post(authentication,postReview);

export default router;
