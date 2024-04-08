const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError('No document found with that associated Id', 400),
      );
    }
    res.status(204).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError('No document found with that associated Id', 400),
      );
    }
    res.send({
      status: 'success',
      message: 'Document updated successfully',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    console.log(doc);

    res.status(201).send({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.findOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // const id = JSON.stringify(req.params.id);
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    // const doc = await Model.findById(req.params.id).populate('reviews');\
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with the ID.', 404));
    }

    res.status(200).send({
      success: true,
      message: 'fetch successful',
      data: {
        data: doc,
      },
    });
  });

exports.findAll = (Model) =>
  catchAsync(async (req, res) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sorting()
      .search()
      .fieldLimiting()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // Send Response
    res.status(200).json({
      status: 'Success',
      requestedAt: req.requestedTime,
      length: doc.length,
      data: {
        data: doc,
      },
    });
  });
