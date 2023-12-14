const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = mongoose.Schema({
  name: {
    type: String,
    unique: [true, 'Name must be unique'],
    required: [true, 'Name is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    Select: false,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: [true, 'Email must be unique'],
    validate: [validator.isEmail, 'Please enter a valid Email'],
  },
  phone: {
    type: Number,
    required: [true, 'Phone number is required'],
  },
  confirmPassword: {
    type: String,
    required: [true, 'Confirm Password is required'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Confirm password ({VALUE}) doesnot match with the password',
    },
  },
  photo: {
    type: String,
  },
});

userSchema.pre('save', async function (next) {
  // Only run this when password is modified
  if (!this.isModified('password')) return next();
  // Hash the password with value 12.
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the confirm Password field.
  this.confirmPassword = undefined;
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
