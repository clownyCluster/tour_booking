class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search() {
    if (this.queryString.search) {
      const searchRegex = new RegExp(`^${this.queryString.search}$`, 'i');

      // Create a $or query for each field
      const orQueries = Object.keys(this.query.model.schema.paths)
        .filter(
          (field) => this.query.model.schema.paths[field].instance === 'String',
        ) // Filter only string fields
        .map((field) => ({ [field]: { $regex: searchRegex } }));

      // Apply the $or queries to the main query
      if (orQueries.length > 0) {
        this.query = this.query.or(orQueries);
      }
    }

    return this;
  }

  filter() {
    // Build Query
    // 1A> Filtering
    const queryObject = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'sort', 'fields'];
    excludedFields.forEach((el) => delete queryObject[el]);
    // 1B> Advance Filtering
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryString));
    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  fieldLimiting() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      console.log(fields);
      this.query = this.query.select(fields);
    } else {
      // this.query = this.query.select('name price duration ratingsAverage summary');
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 15;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
