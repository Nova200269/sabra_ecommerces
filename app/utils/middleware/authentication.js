import jwt from "jsonwebtoken";
import User from "../../models/user/user.js";

export default async (req, res, next) => {
  try {
    let token = "";
    if (req.query.accessToken) token = req.query.accessToken;
    else if (req.query.access_token) token = req.query.access_token;
    else
      token =
        req.headers.authorization?.split(" ")[1] || req.headers.authorization;
    if (!token) return next(new Error("Invalid token", 401));

    let user = jwt.verify(token, process.env.JWT);
    user = await User.findById(user._id);

    if (user) {
      req.user = user;
      return next();
    }

    return next(new Error("Invalid token", 401));
  } catch (e) {
    return next(new Error("Invalid token", 401));
  }
};
