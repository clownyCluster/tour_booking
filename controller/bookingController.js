const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getBookings = factory.findAll(Booking);
exports.createBooking = factory.createOne(Booking);
exports.getSingleBooking = factory.findOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

exports.createCheckOutSession = catchAsync(async (req, res, next) => {
  // 1) Get currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // 2) Create checkout response
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: 'https://dashboard.stripe.com/test/balance',
    cancel_url: 'https://stripe.com/',
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    // line_items: [
    //   {
    //     name: `${tour.name} Tour`,
    //     description: tour.summary,
    //     images: [
    //       `tourbooking-production.up.railway.app/img/tours/${tour.imageCover}`,
    //     ],
    //     price: tour.price * 100,
    //     currency: 'usd',
    //     quantity: 1,
    //   },
    // ],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, // Amount in cents
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `tourbooking-production.up.railway.app/img/tours/${tour.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });
  // 3) Create session as response

  res.status(200).send({
    status: 'success',
    data: {
      session,
    },
  });
});
