import mongoose from "mongoose";
import translate from "./utils/translate.js";

const CurrencySchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    exchangeToUSD: { type: Number, required: true },
  },
  { collection: "currency" ,timestamps:true }
);
export default mongoose.model("currency", CurrencySchema);
