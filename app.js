// const exp = require('constants');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
// eslint-disable-next-line camelcase
const mongo_sanitizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');
const courseRouter = require('./routes/courseRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const bucketListRouter = require('./routes/bucketListRoute');

// 1 . Specify Middleware

const app = express();

// console.log(process.env.NODE_ENV);

// Helmet Middleware

app.use(helmet());

// Development Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body Parser
app.use(express.json());

// Data Sanitizer against NoSQL query injection
app.use(mongo_sanitizer());

// Data sanitizer against XSS scripting
app.use(xss());

// Preventing pollution parameter
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Reading static files
app.use(express.static(`${__dirname}/public`));

// Test Middleware
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.use('/api/v1/bucket-list', bucketListRouter);
app.use('/api/v1/course', courseRouter);

app.get('/', (req, res) => {
  res.status(200).send({
    status: 'Success',
    message: 'Hello from the server',
  });
});

app.all('*', (req, res, next) => {
  next(
    new AppError(`Can't find the url ${req.originalUrl} on this server!`, 404),
  );
});

app.use(globalErrorHandler);

module.exports = app;

// app.get('/api/v1/tours', getTour);
// app.post('/api/v1/tours', createTOur);
// app.patch('/api/v1/tours/:id', updateTOur);
// app.get('/api/v1/tours/:id', getTourById);
