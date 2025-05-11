import fs from "fs/promises";
import Jimp from "jimp";


// compress image form 100 to 0  maxCompress = 0 
const compressValue = 40;
/// Upload icon
export const uploadIcon = async (iconFile) => {
  let imageBuffer = await Jimp.read(iconFile.data);
  imageBuffer.quality(compressValue);

  imageBuffer = await imageBuffer.getBufferAsync(Jimp.MIME_PNG);

  const iconData = {
    name: iconFile.name,
    data: imageBuffer,
  };
  return await uploadFile(
    process.env.BASE_IMAGES_DIRECTORY + "/",
    iconData,
    Date.now().toString(),
    "invalid/",
    "image"
  );
};

/// Upload image
export const uploadImage = async (imageFile) => {
  let imageBuffer = await Jimp.read(imageFile.data);
  imageBuffer.quality(compressValue);

  imageBuffer = await imageBuffer.getBufferAsync(Jimp.MIME_JPEG);

  const imageData = {
    name: imageFile.name,
    data: imageBuffer,
  };

  return await uploadFile(
    process.env.BASE_IMAGES_DIRECTORY + "/",
    imageData,
    Date.now().toString(),
    "invalid/",
    "image"
  );
};

/// Upload video
export const uploadVideo = async (videoFile) => {
  return await uploadFile(
    process.env.BASE_VIDEOS_DIRECTORY + "/",
    videoFile,
    Date.now().toString(),
    "invalid/",
    "video"
  );
};

const uploadFile = async (
  direction,
  file,
  fileName,
  fileFolder,
  fileTypeDir,
  fileType = undefined
) => {
  if (!file) throw new Error("upload file, missing upload file.");

  if (!direction || !fileName || !fileFolder)
    return next(new Error("upload file, missing params"));

  fileName = fileName.replace(/\s+/g, "_");
  fileFolder = fileFolder.replace(/\s+/g, "_");

  fileName =
    fileName +
    (fileType === undefined
      ? file.name.substr(file.name.indexOf("."))
      : fileType);
  const dir = direction + fileFolder;

  try {
    await fs.stat(dir);
  } catch (_) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (e) {}
  }
  try {
    await fs.stat(direction);
  } catch (_) {
    await fs.mkdir(direction, { recursive: true });
  }
  await fs.writeFile(`${dir}/${fileName}`, file.data);

  if (fileTypeDir === "image") return `${process.env.HOST}/images/${fileName}`;
  else if (fileTypeDir === "video")
    return `${process.env.HOST}/videos/${fileName}`;
};
