import User from "../models/user/user.js";
import Guest from "../models/guest.js";
import jwt from "jsonwebtoken";

/*
@des get create New Notification
@route  /createNewNotification
@method POST
@access privet 
*/
export const createNewFCMFromMobile =
  async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1] || req.headers.authorization;
      const { deviceToken, language } = req.body; // Assuming userId and deviceToken are sent in request body
      if (token === undefined || token === null || token === 'null' || token === 'undefined') {
        let guest = await Guest.findOne({ deviceToken: deviceToken });
        if (guest) {
          await Guest.findByIdAndUpdate(guest._id, {
            $set: {
              language: language
            }
          }, { new: true })
        } else {
          guest = new Guest(
            {
              deviceToken: deviceToken,
              language: language
            }
          )
          await guest.save()
        }
      } else {
        let user = jwt.verify(token, process.env.JWT);
        user = await User.findById(user._id);
        user.deviceToken = deviceToken;
        const result = await user.save();
        if (result) {
          await Guest.findOneAndDelete({ deviceToken: deviceToken });
          await User.findByIdAndUpdate(user._id, {
            $set: {
              language: language
            }
          }, { new: true })
        }
      }
      res.status(200).json({ message: 'Device token stored successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to store device token' });
    }
  };