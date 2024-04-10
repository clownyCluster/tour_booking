// const exp = require('constants');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
// eslint-disable-next-line camelcase
const mongo_sanitizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const bodyParser = require('body-parser');
const { Readable } = require('stream');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');
const courseRouter = require('./routes/courseRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const bucketListRouter = require('./routes/bucketListRoute');
const bookingRouter = require('./routes/bookingRoute');

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

class NumberStream extends Readable {
  constructor(options) {
    super(options);
    this.currentNumber = 0;
    this.interval = options.interval || 1000; // default interval is 1 second
    this.timer = setInterval(() => {
      const data = {
        status: 'success',
        number: this.currentNumber + 1,
      };
      this.push(JSON.stringify(data));
      // eslint-disable-next-line no-unused-expressions
      this.currentNumber + 1;
    }, this.interval);

    // When the stream ends, clear the interval
    this.on('end', () => {
      clearInterval(this.timer);
    });
  }

  _read() {}
}

// app.get('/numbers', (req, res) => {
//   const numberStream = new NumberStream({ interval: 1000 }); // Change interval as needed
//   numberStream.pipe(res);
// });
app.get('/numbers', (req, res) => {
  const numberStream = new NumberStream({ interval: 10 });
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');
  numberStream.pipe(res);
});

// Reading static files
app.use(express.static(`${__dirname}/public`));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));

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
app.use('/api/v1/booking', bookingRouter);

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
