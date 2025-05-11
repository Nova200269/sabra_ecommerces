import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import 'express-async-errors';

import { rateLimit } from "express-rate-limit";
import { getClientIp } from "request-ip";

import mongoose from "mongoose";
import upload from "express-fileupload";

import staticFiles from "./app/utils/middleware/staticFiles.js";
import errorHandler from "./app/utils/middleware/error.js";
import router from "./app/routes/index.js";
import task from "./app/utils/tasks/task.js";

dotenv.config({ path: `./config.${process.env.NODE_ENV}.env` });

const app = express();

initMiddleware();
initDatabase();
startApp();
task();
app.use(errorHandler);

function startApp() {
  app.use("/", router);
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

function initMiddleware() {
  app.use(cors());
  app.use(helmet());
  app.use(express.json({ limit: "150kb" }));
  app.use(upload());
  app.use((req, res, next) => {
    res.header("Access-control-Allow-Origin", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  });

  staticFiles(app);

  const limiter = rateLimit({
    limit: 200,
    windowMs: 5 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
      return getClientIp(req);
    },
    message: "Too many requests from this IP, please try again in an hour!",
  });
  app.use(limiter);
}

function initDatabase() {
  const url = process.env.DATABASE.replace(
    "<password>",
    process.env.DATABASE_PASSWORD
  );
  mongoose
    .connect(url, {
      useNewUrlParser: true,
    })
    .then(() => console.log("DB connection went successful!"))
    .catch((e) => console.error(e));

  const { connection: db } = mongoose;
  db.once("open", () => console.log("Connected to mongodb"));
  db.once("disconnected", () => console.log("Disconnected from mongodb"));
  db.on("error", (err) => console.log(`Error connecting to mongodb `, err));
}
