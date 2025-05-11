
import express from "express";
const router = express.Router();
import { createOne, getAll } from "../utils/crud/crud.factory.js";
import authentication from "./../utils/middleware/authentication.js";
import crudRoutes from "../utils/crud/crud.router.js";
import Crud from "../utils/crud/crud.controller.js";
import Product from "../models/product.js";
import HttpError from "./../utils/error/httpError.js";
import review from "../models/review.js";
//Add By Mohamad 

/*
@des post  Review
@route  /api/review
@method POST
@access Privet
*/
export const postReview =
    async (req, res, next) => {
       
        const { product } = req.body;
        const productsPrices = await Product.findOne({
            _id: { $in: product },
        });
        if (!productsPrices) throw new HttpError("invalid products id", 400);
        if (req.user) {
            req.body.user = req.user._id;
        }
        req.query.populate = "user";
        const doc = await review.create(req.body);
        res.status(201).json({
            status: "success",
            data: doc,
        });
       
    };