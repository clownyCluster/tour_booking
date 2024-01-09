const Tour = require('../models/tourModel');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.aliasCheapTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,duration,difficulty,ratingsAverage,summary';
  next();
};

exports.aliasHotTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.fields = 'name,price,duration,ratingsAverage,summary';
  req.query.sort = '-ratingsAverage,price';
  next();
};

// CRUD operations Tour
exports.getTour = factory.findAll(Tour);
exports.getTourById = factory.findOne(Tour, { path: 'reviews' });
exports.createTOur = factory.createOne(Tour);
exports.updateTOur = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numRating: { $sum: '$ratingsQuantity' },
        numTour: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
  ]);

  res.status(200).send({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  console.log(req.params);
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${year}-12-31T23:59:59.999Z`),
        },
      },
    },
  ]);

  console.log('Aggregation Result:', plan);
});
