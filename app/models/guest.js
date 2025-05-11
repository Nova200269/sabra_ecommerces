import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
    {
        deviceToken: {
            type: String,
            required: false
        },
        language: {
            type: String,
            default: 'en',
        },
    },
    { collection: "guest", timestamps: true }
);

export default mongoose.model("guest", guestSchema);
