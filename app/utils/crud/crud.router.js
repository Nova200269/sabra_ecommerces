import Crud from "./crud.controller.js";
import express from "express";
import authentication from "../middleware/authentication.js";
import {admin} from "../middleware/authorization.js";
/**
 * @param {boolean}  setRole
 * @param {boolean}  getRole
 */
export default ({
  className,
  setRole,
  getRole,
  setAuth,
  getAuth,
}) => {
  const router = express.Router();
  const crud = new Crud(className);

  const getMiddlewares = []
  const setMiddlewares = []

  if (setRole !== undefined) setAuth = true;
  if (getRole !== undefined) getAuth = true;

  if(setAuth) setMiddlewares.push(authentication)
  if(getAuth) getMiddlewares.push(authentication)

  if(setRole) setMiddlewares.push(admin)
  if(getRole) getMiddlewares.push(admin)


  router
    .route("/")
    .post(setMiddlewares, crud.create())
    .get(getMiddlewares, crud.getAll());

  router
    .route("/:id")
    .put(setMiddlewares, crud.update())
    .get(getMiddlewares, crud.getOne())
    .delete(setMiddlewares, crud.delete());
  
  
  return router;
};
