class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "populate"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  count() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "populate"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.count(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort && Object.keys(this.queryString.sort).length > 0) {
      this.query = this.query.sort(this.queryString.sort);
    } else {
      if (this.query.mongooseCollection.modelName === "category") {
        let sortObj = { 'sortByDate': -1 };
        this.query = this.query.sort(sortObj);
      }
      let sortObj = { 'createdAt': -1 };
      this.query = this.query.sort(sortObj);
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page || 1;
    const limit = this.queryString.limit || 15;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  populate() {
    this.query = this.query.populate(this.queryString.populate);
    return this;
  }
}
export default APIFeatures;
