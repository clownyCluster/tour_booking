const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'Name cannot be null'],
      validate: [validator.isAlpha, 'A tour must only contain alphabets.'],
    },
    slug: String,
    price: {
      required: true,
      type: Number,
    },
    rating: {
      default: 4.5,
      type: Number,
      min: [1, 'A tour must have a rating above 1.0'],
      max: [5, 'A tour must have a rating below 5.0'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must specify a difficulty'],
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message:
          'A tour must have a difficulty either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
    },
    ratingsQuantity: {
      type: Number,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
    },
    imageCover: {
      type: String,
    },
    images: {
      type: [String],
    },
    startDates: {
      type: [String],
    },
    discount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount ({VALUE}) must be below regular price.',
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Document Middleware: Runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query Middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// Agregation MIddleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
