// const mongoose = require('mongoose');
// const Tour = require('./tourModel');
// // const validator = require('validator');

// const reviewSchema = new mongoose.Schema(
//   {
//     review: {
//       type: String,
//       required: [true, 'Review is required'],
//     },
//     rating: {
//       type: Number,
//       default: 4,
//       validate: {
//         validator: function (val) {
//           return val >= 0 && val <= 5;
//         },
//         message: 'Ratings must be between 0 to 5',
//       },
//     },
//     createdAt: Date,
//     tour: [
//       {
//         type: mongoose.Schema.ObjectId,
//         ref: 'Tour',
//         required: [true, 'A review must be associated with a tour'],
//       },
//     ],
//     user: [
//       {
//         type: mongoose.Schema.ObjectId,
//         ref: 'User',
//         required: [true, 'A review must be associated with a user'],
//       },
//     ],
//   },
//   {
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   },
// );

// reviewSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'user',
//     select: '-guides -phone -email -role -passwordChangedAt -__v',
//   });
//   // .populate({
//   //   path: 'user',
//   // });
//   next();
// });

// reviewSchema.statics.calcAverageRatings = async function (tourId) {
//   const stats = await this.aggregate([
//     {
//       $match: { tour: tourId },
//     },
//     {
//       $group: {
//         _id: '$tour',
//         nRatings: { $sum: 1 },
//         avgRating: { $avg: '$rating' },
//       },
//     },
//   ]);
//   console.log(stats);
//   if (stats > 0) {
//     await Tour.findByIdAndUpdate(tourId, {
//       ratingsQuantity: stats[0].nRatings,
//       ratingsAverage: stats[0].avgRating,
//     });
//   } else {
//     await Tour.findByIdAndUpdate(tourId, {
//       ratingsQuantity: 0,
//       ratingsAverage: 4.5,
//     });
//   }
// };

// reviewSchema.post('save', function () {
//   this.constructor.calcAverageRatings(this.tour);
// });

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   next();
// });

// reviewSchema.post(/^findOneAnd/, async function () {
//   await this.r.constructor.calcAverageRatings();
// });

// // reviewSchema.post('save', function (next) {
// //   this.createdAt = Date.now();
// //   next();
// // });

// const Review = mongoose.model('Review', reviewSchema);

// module.exports = Review;

// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
