const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const createAndSendToken = (user, stautsCode, res) => {
  // eslint-disable-next-line no-use-before-define
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  user.password = undefined;
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(stautsCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  if (!newUser) {
    return next(new AppError('User creation failed. Please try again', 400));
  }
  createAndSendToken(newUser, 201, res);
});

// exports.login = catchAsync(async (req, res, next) => {
//   console.log(req.body);
//   const { email, password } = req.body;

//   // 1) Check if email and password exist
//   if (!email || !password) {
//     return next(new AppError('Email or password cannot be empty', 401));
//   }

//   // 2) Check if user exists
//   const user = await User.findOne({ email: email }).select('+password');
//   if (!user) {
//     return next(new AppError('No account found with that email.', 401));
//   }

//   // Check if the account is currently locked
//   if (user.lockUntil && user.lockUntil > Date.now()) {
//     return next(
//       new AppError('Account is locked. Please try again later.', 401),
//     );
//   }

//   // 3) Check if password is correct
//   const correct = await user.correctPassword(password, user.password);

//   if (!correct) {
//     // Update login attempts and check if the account should be locked
//     user.loginAttempts += 1;
//     if (user.loginAttempts >= 5) {
//       user.lockUntil = Date.now() + 60 * 60 * 1000; // Lock the account for an hour
//       user.loginAttempts = 0; // Reset login attempts
//       await user.save({ validateBeforeSave: false });
//       return next(
//         new AppError('Account is locked. Please try again later.', 401),
//       );
//     }

//     await user.save({ validateBeforeSave: false });

//     return next(new AppError('Please enter correct password', 401));
//   }

//   // Reset login attempts on successful login
//   user.loginAttempts = 0;
//   await user.save({ validateBeforeSave: false });

//   // 4) If everything is OK, send back token and login
//   createAndSendToken(user, 200, res);
// });

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Check If token is send by the client
  const { headers } = req;
  let token;
  if (headers.authorization && headers.authorization.startsWith('Bearer')) {
    token = headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged In. Please login and try again', 401),
    );
  }
  // 2) Authorization of the token

  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  // 3) Check If user still exists

  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exist', 401),
    );
  }
  // 4) Check if user has not changed the password

  if (currentUser.changedPasswordAfter(decodedToken.iat)) {
    return next(
      new AppError('User recently changed password. Please login again', 401),
    );
  }

  req.user = currentUser;

  // Grant Access to Protected Routes
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles : ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to request this action.', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  // 1. Get email from user and check if it exists.
  if (!user) {
    return next(
      new AppError('No ID was found associated with that email', 404),
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP in the user document
  user.passwordResetToken = otp;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Set expiry time (10 minutes)

  await user.save({ validateBeforeSave: false });

  // 3. Send Mail with OTP
  const message = `Forgot your password?\nYour OTP is ${otp}.\nEnter this OTP to change your password.\nIf you didn't forget your password, ignore this email.`;
  //   const message = `
  //   <p>Forgot your password?</p>
  //   <p>Your OTP is:\n<span style="font-size: 22px; font-weight: bold;">${otp}</span></p>
  //   <p>Enter this OTP to change your password.</p>
  //   <p>If you didn't forget your password, ignore this email.</p>
  // `;
  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Password Reset OTP (Valid only for 10 minutes)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset OTP was sent to your email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    next(new AppError('There was an error sending the OTP to your email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the OTP

  const user = await User.findOne({
    passwordResetToken: req.params.token,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. If the OTP is valid and has not expired, set the new password
  if (!user) {
    return next(new AppError('OTP is either invalid or has expired', 404));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3. Update changedPasswordAt property for the user

  // 4. Log the user in and send JWT.

  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Check if the user is logged in

  const user = await User.findById(req.user.id).select('+password');

  // 2. Check if the user entered password matches with the password in the database.
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(
      new AppError(
        'Incorrect Password. Please try again with correct password',
        401,
      ),
    );
  }
  // 3. Update the password.

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  // 4. Log the user in, send JWT token

  createAndSendToken(user, 200, res);
});

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email });

//   // 1. Get email from user and check if it exists.
//   if (!user) {
//     return next(
//       new AppError('No ID was found associated with that email', 404),
//     );
//   }

//   // 2. Generate random reset token
//   const resetToken = user.createResetPasswordToken();
//   await user.save({ validateBeforeSave: false });
//   // 3. Send Mail
//   const resetUrl = `${req.protocol}://${req.get(
//     'host',
//   )}/api/v1/users/resetPassword/${resetToken}`;

//   const message = `Forgot your password? Submit a change request with password at ${resetUrl} to change your password.\nIf you didn't forgot your password ignore this email`;
//   try {
//     await sendEmail({
//       email: req.body.email,
//       subject: 'Password Reset token(Valid only for 10 minutes)',
//       message,
//     });

//     res.status(200).json({
//       status: 'success',
//       message: 'Password reset token was sent to your email',
//     });
//   } catch (error) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     next(
//       new AppError('There was an error sending the token to your email', 500),
//     );
//   }

//   //   next();
// });

// exports.resetPassword = catchAsync(async (req, res, next) => {
//   // 1. Get user based on the token1

//   const hashedToken = crypto
//     .createHash('sha256')
//     .update(req.params.token)
//     .digest('hex');

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });
//   // 2. If the token has not expired and there is the user, set the new password
//   if (!user) {
//     return next(new AppError('Token is either invalid or has expired', 404));
//   }

//   user.password = req.body.password;
//   user.confirmPassword = req.body.confirmPassword;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save();
//   // 3. Update changedPasswordAt property for the user
//   user.passwordChangedAt = Date.now();
//   await user.save();
//   // 4. Log the user in, sent jwt.

//   const token = signToken(user._id);
//   res.status(200).json({
//     status: 'success',
//     message: 'Password changed successfully',
//     token: token,
//     data: {
//       user,
//     },
//   });
// });

/// //    Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exists
  if (!email || !password) {
    return next(new AppError('Email or password cannot be empty', 401));
  }
  // 2) Check if user exists and password is correct

  const user = await User.findOne({ email: email }).select('+password');
  if (!user) {
    return next(new AppError('No account found with that email.', 401));
  }
  //   3) If everything is ok, send back token and login

  const correct = await user.correctPassword(password, user.password);

  if (!correct) {
    return next(new AppError('Please enter correct password', 401));
  }
  createAndSendToken(user, 200, res);
});
