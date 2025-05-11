import schedule from "node-cron";
import { deleteOtp } from "../../controllers/auth.js";
import fs from "fs";

function deleteInvalidImages() {
  console.log("RUN DELETE INVALID IMAGES");
  const folderPath = process.env.BASE_IMAGES_DIRECTORY + "/invalid";
  const files = fs.readdirSync(folderPath);

  for (let i = 0; i < files.length; i++) {
    const filePath = `${folderPath}/${files[i]}`;
    fs.unlinkSync(filePath);
  }
}

function deleteInvalidVideos() {
  console.log("RUN DELETE INVALID VIDEOS");
  const folderPath = process.env.BASE_VIDEOS_DIRECTORY + "/invalid";
  const files = fs.readdirSync(folderPath);

  for (let i = 0; i < files.length; i++) {
    const filePath = `${folderPath}/${files[i]}`;
    fs.unlinkSync(filePath);
  }
}

export default () => {
  console.log("INIT TASK");
  removeOldScheduledTasks();
  schedule.schedule("0 */12 * * *", deleteOtp);
  schedule.schedule("0 */12 * * *", deleteInvalidImages);
  schedule.schedule("0 */12 * * *", deleteInvalidVideos);
};

function removeOldScheduledTasks() {
  const scheduledJobs = schedule.scheduledJobs;

  for (let jobName in scheduledJobs) {
    scheduledJobs[jobName].cancel();
    delete scheduledJobs[jobName];
  }
}
