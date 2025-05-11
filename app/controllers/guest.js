import Guest from "./../models/guest.js";

export const getAllGuest = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;
    const guests = await Guest.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    const count = guests.length === 0 ? 0 : await Guest.countDocuments();
    res.status(200).json({
        status: 'success',
        count: guests.length,
        result: guests,
        total_count: count
    });
};