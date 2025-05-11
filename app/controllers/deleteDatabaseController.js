import User from "../models/user/user.js";
import Otp from "../models/user/otp.js";
import Brand from "../models/brand.js";
import Category from "../models/category.js";
import Currency from "../models/currency.js";
import HomeImages from "../models/homeImages.js";
import NewVersion from "../models/newVersion.js";
import Notification from "../models/notification.js";
import NotificationSend from "../models/notificationSend.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import Prop from "../models/prop.js";
import Review from "../models/review.js";

export async function deleteTheDataBase(req, res) {
    try {
        if (req.query.code === process.env.DATABASE_DELETE_CODE) {
            await Otp.deleteMany({});
            await User.deleteMany({});
            await Brand.deleteMany({});
            await Category.deleteMany({});
            await Currency.deleteMany({});
            await HomeImages.deleteMany({});
            await NewVersion.deleteMany({});
            await Notification.deleteMany({});
            await NotificationSend.deleteMany({});
            await Order.deleteMany({});
            await Product.deleteMany({});
            await Prop.deleteMany({});
            await Review.deleteMany({});
            res.status(200).json({ message: 'the database has been deleted' });
        } else {
            res.status(404).json({
                status: "error",
                message: "unauthorized"
            })
        }
    } catch (error) {
        res.status(404).json({
            status: "error",
            message: error
        })
    }
}