const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
// const catchAsync = require('../utils/catchAsync');

exports.setTourIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.findAll(Review);
exports.getReviews = factory.findOne(Review);
exports.addReviews = factory.createOne(Review);
exports.deleteReviews = factory.deleteOne(Review);
exports.editReviews = factory.updateOne(Review);
