const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// exports.checkId = (req, res, next, val) => {
//   console.log(`THis is the ID: ${val}.....`);
//   // if (req.params.id > tours.length) {
//   //   return res.status(404).send({
//   //     status: 'failed',
//   //     message: 'Invalid Id',
//   //   });
//   // }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   console.log(req.body);
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).send({
//       status: 'failed',
//       message: 'Name or price cannot be null',
//     });
//   }
//   next();
// };

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

exports.getTour = catchAsync(async (req, res) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sorting()
    .fieldLimiting()
    .paginate();
  const tours = await features.query;

  // Send Response
  res.status(200).json({
    status: 'Success',
    requestedAt: req.requestedTime,
    length: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTourById = catchAsync(async (req, res, next) => {
  console.log(req.params);
  // const id = JSON.stringify(req.params.id);

  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with the ID.', 404));
  }

  res.status(200).send({
    success: true,
    message: 'fetch successful',
    data: {
      tour,
    },
  });
});

exports.createTOur = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);

  res.status(201).send({
    status: 'success',
    data: {
      newTour,
    },
  });
});

exports.updateTOur = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.send({
    status: 'success',
    message: 'patch request received successfully',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res) => {
  console.log(req.params);

  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    message: 'data deleted successfully',
  });
});

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
