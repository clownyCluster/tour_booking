const User = require('../models/userModel');

exports.getUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      records: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: 'Something went wrong',
    });
  }
};

exports.updateUser = (req, res) => {
  res.status(500).send({
    status: 'failed',
    message: 'This api is not implemented yet',
  });
};
