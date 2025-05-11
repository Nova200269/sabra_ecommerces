import express from "express";
import authentication from "../utils/middleware/authentication.js";
import { admin } from "../utils/middleware/authorization.js";
import { deleteTheDataBase } from "../controllers/deleteDatabaseController.js"

const router = express.Router();

router.route("/")
    .delete(authentication, admin, deleteTheDataBase)

export default router
