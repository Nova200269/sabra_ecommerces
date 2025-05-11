import express from "express";
import {createCurrencies,deleteCurrencies,getAllCurrencies,getCurrenciesById,updateCurrencies} from "../controllers/currency.js";

import authentication from "./../utils/middleware/authentication.js";


const router = express.Router();

router.route("/").get(getAllCurrencies)
                 .post(authentication,createCurrencies)


router.route("/:id").get(authentication,getCurrenciesById)
                    .delete(authentication,deleteCurrencies)
                    .put(authentication,updateCurrencies);




export default router;