import express from "express";
import {getNewVersion,addNewVersion} from "../controllers/newVersion.js";
import authentication from "./../utils/middleware/authentication.js";



const router = express.Router();

router.route("/")
            .get(getNewVersion) 
            .post(authentication,addNewVersion)   

export default router;
