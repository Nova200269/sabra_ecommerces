import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Prop from "./../models/prop.js";

export function getToken(payload) {
  return jwt.sign(payload, process.env.JWT,
    {
      expiresIn: process.env.USER_JWT_EXPIRE_DURATION,
    }
  );
}

export function generateOTP() {
  const min = 1000;
  const max = 9999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function findPropertiesWithKey(obj, key) {
  let results = [];
  for (let prop in obj) {
    if (prop.includes(key)) {
      results.push({
        key: prop,
        value: obj[prop],
      });
    }
    if (typeof obj[prop] === "object") {
      results = results.concat(findPropertiesWithKey(obj[prop], key));
    }
  }
  return results;
}

export async function createOrUpdateProp(props) {
  for (const prop of props) {
    if (prop._id) {
      await Prop.findOneAndUpdate({ _id: prop._id }, prop);
    } else {
      //add new prop
      const newProp = await Prop.create(prop);
      prop._id = newProp._id;
    }
  }
  return props;
}

export function createSlug(string) {
  return string?.toLowerCase() // Convert the string to lowercase
    ?.replace(/\s+/g, '-') // Replace spaces with hyphens
    ?.replace(/[^\w\-]+/g, '') // Remove all non-word characters (except hyphens)
    ?.replace(/\-\-+/g, '-') // Replace multiple hyphens with a single hyphen
    ?.replace(/^-+/, '') // Trim hyphens from the start
    ?.replace(/-+$/, '');
}

export function extractKeywords(keywordString) {
  return keywordString
    .split(" ")
    .map(word => word.trim().toLowerCase())
    .filter(word => word.length > 0); // remove empty strings
}

export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export function getNotificationContent(target_type, status) {
  let routName;
  let title;
  let body;
  if (target_type === 'product') {
    routName = 'newProduct';
    title = [
      { lang: 'eng', value: 'Exciting new product: {{name}}!' },
      { lang: 'ar', value: 'منتج جديد مثير: {{name}}!' }
    ];
    body = [
      { lang: 'eng', value: 'Explore {{name}} and enjoy exclusive deals!' },
      { lang: 'ar', value: 'استكشف {{name}} واستمتع بالعروض الحصرية!' }
    ];
  } else if (target_type === 'category') {
    routName = 'offerCategory';
    title = [
      { lang: 'eng', value: 'Special offers in the {{name}} category!' },
      { lang: 'ar', value: 'عروض خاصة في فئة {{name}}!' }
    ];
    body = [
      { lang: 'eng', value: "Don't miss amazing discounts in {{name}}!" },
      { lang: 'ar', value: 'لا تفوت الخصومات المذهلة في {{name}}!' }
    ];
  } else if (target_type === 'brand') {
    routName = 'offerBrand';
    title = [
      { lang: 'eng', value: 'Exclusive deals on {{name}} just for you!' },
      { lang: 'ar', value: 'عروض حصرية على {{name}} فقط من أجلك!' }
    ];
    body = [
      { lang: 'eng', value: 'Check out our latest offers on {{name}} products!' },
      { lang: 'ar', value: 'اطلع على أحدث عروضنا على منتجات {{name}}!' }
    ];
  } else if (target_type === 'order') {
    routName = 'newOrder';
    title = [
      { lang: 'eng', value: 'New order' },
      { lang: 'ar', value: 'طلب جديد' }
    ];
    body = [
      { lang: 'eng', value: "Check out the new order" },
      { lang: 'ar', value: 'اطلع على الطلب الجديد' }
    ];
  } else if (status) {
    routName = 'status_order';
    const statusMap = {
      pending: "قيد الانتظار",
      accepted: "تم قبوله",
      cancelled: "تم الالغائه"
    };
    let arStatus = statusMap[status.toLowerCase()] || "";
    title = [
      { lang: 'eng', value: 'About your order' },
      { lang: 'ar', value: 'حول طلبك' }
    ];
    body = [
      { lang: 'eng', value: 'Your order has been ' + status },
      { lang: 'ar', value: 'طلبك ' + arStatus }
    ];
  } else if (target_type === 'wellcome') {
    routName = 'wellcome';
    title = [
      { lang: 'eng', value: `Welcome, {{name}}! 🎉` },
      { lang: 'ar', value: `مرحبًا {{name}}! 🎉` }
    ];
    body = [
      { lang: 'eng', value: `We’re thrilled to have you here. Explore and enjoy amazing offers!` },
      { lang: 'ar', value: `يسعدنا انضمامك إلينا. استمتع بالعروض الرائعة!` }
    ];
  } else if (target_type === 'welcome_back') {
    routName = 'welcome_back';
    title = [
      { lang: 'eng', value: 'Welcome back, {{name}}! 👋' },
      { lang: 'ar', value: 'مرحبًا بعودتك، {{name}}! 👋' }
    ];
    body = [
      { lang: 'eng', value: 'We’re glad to see you again. Let’s continue where you left off.' },
      { lang: 'ar', value: 'سعداء برؤيتك مرة أخرى. دعنا نكمل من حيث توقفت.' }
    ];
  }
  return { routName, title, body };
}

