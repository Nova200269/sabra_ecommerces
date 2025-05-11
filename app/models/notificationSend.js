import mongoose from "mongoose";
import translate from "./utils/translate.js";


const textSchema = new mongoose.Schema({
  title: {
    type: translate,
    required: true,
  },
  body: {
    type: translate,
    required: true,
  },
}, { _id: false });

const goToSchema = new mongoose.Schema({
  rout: {
    type: String,
    required: true,
  },
  goToId: {
    type: String,
    required: true,
  },
}, { _id: false });

const notificationSchema = new mongoose.Schema(
  {
    text: textSchema,
    goTo: { type:goToSchema, required: false, },
    readUser: { type: [String], default: [] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    image: { type: String, default: '' },
  },
  { collection: "notificationSend" , timestamps: true}
);

export default mongoose.model("notificationSend", notificationSchema);
