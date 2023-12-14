const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsync(async (req, res, next) => {
  console.log(req.body);

  const newUser = await User.create(req.body);
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    message: 'User created successfully',
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exists
  if (!email || !password) {
    return next(new AppError('Email or password cannot be empty', 400));
  }
  // 2) Check if user exists and password is correct

  const user = await User.findOne({ email: email }).select('+password');
  if (!user) {
    return next(new AppError('No account found with that email.', 400));
  }
  //   3) If everything is ok, send back token and login

  const correct = await user.correctPassword(password, user.password);
  //   console.log(password);
  //   console.log(user.password);
  //   console.log(pass);
  //   console.log(correct);

  if (!correct) {
    console.log('Wrong Password');
    return next(new AppError('Please enter correct password', 400));
  }
  console.log('Login successful', user);
  res.status(200).json({
    status: 'success',
    user: user,
    token: signToken(user._id),
  });
});
