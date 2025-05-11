import express from "express";

export default (app) => {
  app.use(
    "/images",
    express.static(process.env.BASE_IMAGES_DIRECTORY + "/valid")
  );
  app.use(
    "/images",
    express.static(process.env.BASE_IMAGES_DIRECTORY + "/invalid")
  );

  app.use(
    "/videos",
    express.static(process.env.BASE_VIDEOS_DIRECTORY + "/valid")
  );
  app.use(
    "/videos",
    express.static(process.env.BASE_VIDEOS_DIRECTORY + "/invalid")
  );
};
