import User from "../models/user/user.js";
import Guest from "../models/guest.js";
import admin from "firebase-admin";
const qq = {

};
function initializeApp() {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(qq),
    });
  } catch (error) {
    console.log("Firebase initialize app error : ", error);
  }
}
initializeApp()

export async function sendBroadcastNotification(title, body) {
  try {
    const users = await User.find({ deviceToken: { $exists: true, $ne: null } });
    const guests = await Guest.find({ deviceToken: { $exists: true, $ne: null } });
    const allRecipients = [...users, ...guests].filter(u => u.deviceToken);
    for (const recipient of allRecipients) {
      const language = recipient.language || 'en';
      const deviceToken = recipient.deviceToken;
      if (!deviceToken) continue;
      try {
        const i = language === 'en' ? 0 : 1;
        await sendNotificationToUser(deviceToken, title[i].value, body[i].value);
      } catch (error) {
        if (error.code === 'messaging/registration-token-not-registered') {
          await User.updateOne({ deviceToken }, { $unset: { deviceToken: "" } });
          await Guest.updateOne({ deviceToken }, { $unset: { deviceToken: "" } });
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

export async function sendNotificationToUser(deviceToken, title, body) {
  if (!deviceToken || !title || !body) {
    throw new Error("Missing required parameters: deviceToken, title, or body.");
  }
  const message = {
    token: deviceToken,
    notification: {
      title: title,
      body: body,
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    if (error.code === 'messaging/registration-token-not-registered') {
      await User.updateOne({ deviceToken }, { $unset: { deviceToken: "" } });
    }
    throw error;
  }
}
