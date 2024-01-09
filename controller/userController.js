const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. check if user tries to update the password
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'You cannot change the password from here. Try updating from Update Password.',
        400,
      ),
    );
  }

  // 2. Filtered out fields which are not allowed to be updated
  const filteredBody = filteredObj(req.body, 'name', 'email');

  console.log(req.body);

  // 3. Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(203).json({
    status: 'success',
    message: 'User modified successfully',
    data: {
      user: updatedUser,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = factory.findOne(User);
exports.getAllUsers = factory.findAll(User);
// Not for passwords and only admins can update user.
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.createUser = factory.createOne(User);
