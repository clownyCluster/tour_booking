// const exp = require('constants');
const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const bucketListRouter = require('./routes/bucketListRoute');

// 1 . Specify Middleware

const app = express();

// console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.use('/api/v1/bucket-list', bucketListRouter);

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
