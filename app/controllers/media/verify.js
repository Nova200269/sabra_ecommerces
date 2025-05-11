import fs from "fs/promises";
import { findPropertiesWithKey } from "../../utils/functions.js";

export const verifyVideo = async (videoUrl) => {
  if (!videoUrl || typeof videoUrl !== "string") {
    console.error("Invalid videoUrl:", videoUrl);
    return;
  }

  const videoName = videoUrl.substring(
    process.env.HOST.length + 8,
    videoUrl.length
  );
  const sourcePath = `${process.env.BASE_VIDEOS_DIRECTORY}/invalid/${videoName}`;
  const destinationPath = `${process.env.BASE_VIDEOS_DIRECTORY}/valid/${videoName}`;

  console.log("Verifying video:", videoUrl);
  console.log("Source Path:", sourcePath);
  console.log("Destination Path:", destinationPath);

  try {
    await fs.stat(`${process.env.BASE_IMAGES_DIRECTORY}/valid/`);
  } catch (error) {
    console.warn("Creating valid images directory");
    await fs.mkdir(`${process.env.BASE_IMAGES_DIRECTORY}/valid/`, {
      recursive: true,
    });
  }

  try {
    await fs.rename(sourcePath, destinationPath);
    console.log("Video moved successfully");
  } catch (error) {
    console.error("Error moving video:", error);
  }
};

export const verifyImage = async (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== "string") {
    console.error("Invalid imageUrl:", imageUrl);
    return;
  }

  const imageName = imageUrl.substring(
    process.env.HOST.length + 8,
    imageUrl.length
  );
  const sourcePath = `${process.env.BASE_IMAGES_DIRECTORY}/invalid/${imageName}`;
  const destinationPath = `${process.env.BASE_IMAGES_DIRECTORY}/valid/${imageName}`;

  console.log("Verifying image:", imageUrl);
  console.log("Source Path:", sourcePath);
  console.log("Destination Path:", destinationPath);

  try {
    await fs.stat(`${process.env.BASE_IMAGES_DIRECTORY}/valid/`);
  } catch (error) {
    console.warn("Creating valid images directory");
    await fs.mkdir(`${process.env.BASE_IMAGES_DIRECTORY}/valid/`, {
      recursive: true,
    });
  }

  fs.rename(sourcePath, destinationPath)
    .then(() => console.log("Image moved successfully"))
    .catch((error) => console.error("Error moving image:", error));
};

export const verifyMediaInBody = (body) => {
  console.log("Received body:", body);

  const images = findPropertiesWithKey(body, "image").filter(item => item && item.value);
  const icons = findPropertiesWithKey(body, "icon").filter(item => item && item.value);

  console.log("Images found:", images);
  console.log("Icons found:", icons);

  /// Verify images
  for (let i = 0; i < images.length; i++) {
    let imageUrl = images[i].value;
    if (Array.isArray(imageUrl)) {
      for (let e = 0; e < imageUrl.length; e++) {
        console.log("Processing image:", imageUrl[e]);
        verifyImage(imageUrl[e]);
      }
    } else {
      console.log("Processing image:", imageUrl);
      verifyImage(imageUrl);
    }
  }

  // Verify icons
  for (let i = 0; i < icons.length; i++) {
    let iconUrl = icons[i].value;
    if (Array.isArray(iconUrl)) {
      for (let e = 0; e < iconUrl.length; e++) {
        console.log("Processing icon:", iconUrl[e]);
        verifyImage(iconUrl[e]);
      }
    } else {
      console.log("Processing icon:", iconUrl);
      verifyImage(iconUrl);
    }
  }
};