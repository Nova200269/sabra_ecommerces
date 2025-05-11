import NotificationSend from "../models/notificationSend.js";
import User from "../models/user/user.js";
import Guest from "../models/guest.js";
import HttpError from "../utils/error/httpError.js";
import { sendBroadcastNotification, sendNotificationToUser } from '../controllers/notification.js';
// import bodyParser from 'body-parser'; 

// to keep the versions from 1.0.7 running with old way
export const getUnreadNotification =
    async (req, res, next) => {
        try {
            const result = await NotificationSend.find({
                $or: [
                    { user: { $eq: req.user._id }, },
                    { user: { $eq: null } }
                ],
                readUser: { $nin: req.user._id },
            }).sort({ createdAt: -1 });
            //if result > 0 user have notification
            if (result.length > 0) {
                let updateResult = result;
                for (let index = 0; index < updateResult.length; index++) {
                    const element = updateResult[index];
                    const filter = { _id: element._id };
                    const update = { $push: { readUser: req.user._id } };
                    const options = { new: true };
                    NotificationSend.findOneAndUpdate(filter, update, options)
                        .then(updatedDoc => {
                        })
                        .catch(err => {
                            console.error('Error updating document:', err);
                        });
                }
                res.status(201).json({
                    status: "success",
                    data: result[0],
                });
            } else {
                res.status(400).json({
                    status: "error",
                    error: {
                        statusCode: 400,
                        status: "error"
                    },
                    message: "No document found with that Id",
                    stack: "Error: No document found with that Id\n    at file:///usr/src/app/app/utils/crud/crud.factory.js:61:19\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)"
                });
            }
        } catch (error) {
            return next(error);
        }
    };

//Add By Mohamad 

/*
@des get all notification
@route  /notificationsend
@method Get
@access privet
*/
export const getAllNotification =
    async (req, res, next) => {
        const page = req.query.page === undefined ? 1 : req.query.page;
        const limit = req.query.limit === undefined ? 8 : req.query.limit;
        const skip = (page - 1) * limit;
        try {
            const result = await NotificationSend.find(
                {
                    $or: [
                        { user: { $eq: req.user._id }, },
                        { user: { $eq: null } }
                    ],
                }
            )
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
            const count = await NotificationSend.count(
                {
                    $or: [
                        { user: { $eq: req.user._id }, },
                        { user: { $eq: null } }
                    ],
                }
            );
            res.status(201).json({
                status: "success",
                results: result.length,
                data: result,
                total_count: count
            });
        } catch (error) {
            return next(error);
        }
    };


//Add By Mohamad 

/*
@des get GEST notification
@route  /notificationsend
@method Get
@access public
*/
export const getAllNotificationGuest =
    async (req, res, next) => {
        const page = req.query.page === undefined ? 1 : req.query.page;
        const limit = req.query.limit === undefined ? 8 : req.query.limit;
        const skip = (page - 1) * limit;
        try {
            const result = await NotificationSend.find({
                user: { $eq: null },
            })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
            const count = await NotificationSend.count({
                user: { $eq: null },
            });
            res.status(201).json({
                status: "success",
                results: result.length,
                data: result,
                total_count: count
            });
        } catch (error) {
            return next(error);
        }
    };

/*
@des get create New Notification
@route  /createNewNotification
@method POST
@access privet 
*/
export const createNewNotification =
    async (req, res, next) => {
        const { text, token } = req.body;
        try {
            let notifationSend = NotificationSend(
                {
                    text: req.body.text,
                    user: req.body.user,
                    goTo: req.body.goTo,
                }
            );
            if (req.body.user) {
                const findUser = await User.findById(req.body.user);
                if (!findUser) {
                    next(new HttpError("no user Found", 400));
                    return;
                }
            }
            if (token) {
                // const user = await User.findById(req.user.id);
                let language = await Guest.findOne({ deviceToken: token }).language;
                if (!language) {
                    language = await User.findOne({ deviceToken: token }).language;
                }
                const i = language === 'en' ? 0 : 1
                const title = text.title[i].value;
                const body = text.body[i].value;
                await sendNotificationToUser(token, title, body)
            } else {
                const title = text.title
                const body = text.body
                await sendBroadcastNotification(title, body);
            }
            const result = await notifationSend.save();
            res.status(201).json({
                status: "success",
                data: result,
            });
        } catch (error) {
            return next(error);
        }
    };



//Add By Mohamad 

/*
@des get new Notification
@route  /newnotification
@method Get
@access private
*/
export const getUnreadNotificationGuest =
    async (req, res, next) => {
        try {
            if (!req.body.deviceToken) {
                res.status(404).json({
                    status: "error",
                    message: "deviceToken is required"
                })
            }
            const result = await NotificationSend.find({
                $or: [
                    { user: { $eq: null } }
                ],
                readUser: { $nin: req.body.deviceToken },
            }).sort({ createdAt: -1 });
            //if result > 0 user have notification
            if (result.length > 0) {
                let updateResult = result;
                for (let index = 0; index < updateResult.length; index++) {
                    const element = updateResult[index];
                    const filter = { _id: element._id };
                    const update = { $push: { readUser: req.body.deviceToken } };
                    const options = { new: true };
                    NotificationSend.findOneAndUpdate(filter, update, options)
                        .then(updatedDoc => {
                        })
                        .catch(err => {
                            console.error('Error updating document:', err);
                        });
                }
                res.status(201).json({
                    status: "success",
                    data: result[0],
                });
            } else {
                res.status(400).json({
                    status: "error",
                    error: {
                        statusCode: 400,
                        status: "error"
                    },
                    message: "No document found with that Id",
                    stack: "Error: No document found with that Id\n    at file:///usr/src/app/app/utils/crud/crud.factory.js:61:19\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)"
                });
            }
        } catch (error) {
            return next(error);
        }
    };

export const getUnreadNotificationUser =
    async (req, res, next) => {
        try {
            if (!req.user.deviceToken) {
                res.status(404).json({
                    status: "error",
                    message: "deviceToken is required"
                })
            }
            const result = await NotificationSend.find({
                $or: [
                    { user: { $eq: req.user._id }, },
                    { user: { $eq: null } }
                ],
                readUser: { $nin: req.user.deviceToken },
            }).sort({ createdAt: -1 });
            //if result > 0 user have notification
            if (result.length > 0) {
                let updateResult = result;
                for (let index = 0; index < updateResult.length; index++) {
                    const element = updateResult[index];
                    const filter = { _id: element._id };
                    const update = { $push: { readUser: req.user.deviceToken } };
                    const options = { new: true };
                    NotificationSend.findOneAndUpdate(filter, update, options)
                        .then(updatedDoc => {
                        })
                        .catch(err => {
                            console.error('Error updating document:', err);
                        });
                }
                res.status(201).json({
                    status: "success",
                    data: result[0],
                });
            } else {
                res.status(400).json({
                    status: "error",
                    error: {
                        statusCode: 400,
                        status: "error"
                    },
                    message: "No document found with that Id",
                    stack: "Error: No document found with that Id\n    at file:///usr/src/app/app/utils/crud/crud.factory.js:61:19\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)"
                });
            }
        } catch (error) {
            return next(error);
        }
    };


//Add By Mohamad 

/*
@des delete all notification
@route  /notificationsend
@method delete
@access privet
*/
export const deleteAllNotification =
    async (req, res, next) => {
        try {
            await NotificationSend.deleteMany({});
            res.status(200).json({
                status: "success",
                message: "All notifications have been deleted."
            });
        } catch (err) {
            console.log(err);
            next(err);
        }
    };

//Add By Mohamad 

/*
@des delete  notification by id
@route  /notificationsend
@method delete
@access privet
*/
export const deleteNotificationById =
    async (req, res, next) => {
        try {
            const result = await NotificationSend.findByIdAndDelete(req.query.id);
            if (result) {
                res.status(201).json({
                    status: "success",
                    data: `Notification with ID ${req.query.id} deleted.`,
                });
            } else {
                res.status(400).json({
                    status: "error",
                    data: `Notification with ID ${req.query.id} not found.`,
                });
            }
        } catch (err) {
            next(err);
        }
    };


export async function saveAndSendNotification(title, body, image, goToId, rout) {
    try {
        let text = {
            "title": title,
            "body": body
        }
        let notifationSend = NotificationSend(
            {
                text: text,
                user: undefined,
                goTo: { "rout": rout, "goToId": goToId },
                image: image ? image : undefined
            }
        );
        await sendBroadcastNotification(title, body);
        const result = await notifationSend.save();
        return result
    } catch (error) {
        throw new HttpError(error, 400);
    }
}

export async function saveAndSendNotificationForOneUser(title, body, image, goToId, rout, toke, user_id) {
    try {
        let text = {
            "title": title,
            "body": body
        }
        let notifationSend = NotificationSend(
            {
                text: text,
                user: user_id,
                goTo: { "rout": rout, "goToId": goToId },
                //   image:image?image:undefined
            }
        );
        const guest = await Guest.findOne({ deviceToken: toke });
        let language = guest?.language;
        if (!language) {
            const user = await User.findOne({ deviceToken: toke });
            language = user?.language;
        }
        if (language === 'en')
            language = 'eng'
        const titleObj = text.title.find(t => t.lang === language);
        const bodyObj = text.body.find(b => b.lang === language);
        const title1 = titleObj?.value || "Default Title";
        const body1 = bodyObj?.value || "Default Body";
        await sendNotificationToUser(toke, title1, body1);
        const result = await notifationSend.save();
        return result
    } catch (error) {
        throw new HttpError(error, 400);
    }

}