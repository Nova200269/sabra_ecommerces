import APIFeatures from "./apiFeatures.js";
import HttpError from "./../error/httpError.js";
import { verifyMediaInBody } from "./../../controllers/media/verify.js";
import { isValidObjectId } from "../functions.js";

export const deleteOne = (Model) => async (req, res, next) => {
  const doc = await Model.findOneAndDelete({ _id: req.params.id });
  if (!doc) {
    return next(new HttpError("No document found with that Id", 400));
  }
  //TODO:
  //this.deleteImages(doc.toObject(), next);
  res.status(204).json({
    status: "success",
    data: null,
  });
};

export const updateOne = (Model, popOptions) => async (req, res, next) => {
  let doc = await Model.findOne({ _id: req.params.id });

  if (!doc) {
    return next(new HttpError("No document found with that Id", 400));
  }

  Object.assign(doc, req.body);
  await doc.save();
  verifyMediaInBody(req.body);

  res.status(200).json({
    status: "success",
    data: doc,
  });
};

export const createOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);
    verifyMediaInBody(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = (Model) => async (req, res, next) => {
  let query;
  let doc;
  //add Mohamad isValidObjectId  not return false if req.params.id not id
  if (isValidObjectId(req.params.id)) query = Model.findById(req.params.id);
  if (req.query.populate) query = query.populate(req.query.populate);
  if (isValidObjectId(req.params.id)) doc = await query;
  if (!doc) {
    query = Model.findOne({ slug: req.params.id });
    if (req.query.populate) query = query.populate(req.query.populate);
    doc = await query;
    if (!doc) {
      return next(new HttpError("No document found with that Id", 400));
    }

  }

  res.status(200).json({
    status: "success",
    data: doc,
  });
  return doc;
};

export const getAll = (Model) => async (req, res, next) => {
  if (!req.query.$or) {
    req.query.$or = [{ blocked: false }, { blocked: { $exists: false } }];
  } else {
    // Combine the existing `$or` (from name search) with the blocked filter
    req.query.$and = [
      { $or: req.query.$or },
      { $or: [{ blocked: false }, { blocked: { $exists: false } }] }
    ];
    delete req.query.$or; // Remove the top-level $or to prevent conflict
  }
  const features = new APIFeatures(Model, req.query)
    .filter()
    .paginate()
    .limitFields()
    .populate()
    .sort();

  // const doc = await features.query.explain();
  const doc = await features.query;
  const countFeatures = new APIFeatures(Model, req.query).filter().count();
  const count = await countFeatures.query;

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: doc,
    total_count: count,
  });
  return doc;
};

export const count = (Model, filter) => async (req, res) => {
  const count = await Model.countDocuments(filter);
  res.status(200).json({
    status: "success",
    results: count,
    data: null,
  });
};
