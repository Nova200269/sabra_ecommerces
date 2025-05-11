import mongoose from "mongoose";
import { sendBroadcastNotification } from "../controllers/notification.js";

const notificationSchema = new mongoose.Schema(
  {
    title: String,
    body: String,
  },
  { collection: "notification", timestamps: true }
);

notificationSchema.post("save", async function () {
  try {
    await sendBroadcastNotification(this.title, this.body);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
});
export default mongoose.model("notification", notificationSchema);
