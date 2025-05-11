
import mongoose from "mongoose";
import translate from "./utils/translate.js";


const newVersionSchema = new mongoose.Schema(
    {
      min: {type: Number,require: true,default:1}, 
      max: {type: Number,require: true,default:1},
      idVersion: {type: Number,require: true,default:1}, 
 
      message: {
        type: translate,
        default:[
        {
          lang: 'eng',
          value: "A new update for Advanced is now available! Update now to enjoy the latest features and improvements.",
        },
        {
            lang: 'ar',
            value: "تحديث جديد متاح الآن لتطبيق أدفانس! قم بالتحديث الآن للاستمتاع بأحدث الميزات والتحسينات.",
          },
      ],require: true,
    },
    },
    { collection: "newVersion", timestamps: true }
  );

  export default mongoose.model("newVersion", newVersionSchema);

  

