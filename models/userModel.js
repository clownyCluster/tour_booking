const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, 'Name must be unique'],
      required: [true, 'Name is required'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    // confirmPassword: {
    //   type: String,
    //   required: [true, 'Confirm Password is required'],
    //   validate: {
    //     validator: function (val) {
    //       return val === this.password;
    //     },
    //     message: 'Confirm password ({VALUE}) doesnot match with the password',
    //   },
    // },
    confirmPassword: {
      type: String,
      required: function () {
        // Make confirmPassword required during signup, password change, and reset password
        return this.isModified('password') || this.isNew;
      },
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: 'Confirm password ({VALUE}) does not match with the password',
      },
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
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

    photo: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    loginAttempts: {
      select: false,
      type: Number,
      default: 0,
    },
    lockUntil: {
      select: false,
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre('save', async function (next) {
  // Only run this when password is modified
  if (!this.isModified('password')) return next();
  // Hash the password with value 12.
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the confirm Password field.
  this.confirmPassword = undefined;
});

// userSchema.pre(/^find/, function (next) {
//   this.select('-password');
//   next();
// });

// Middleware to determine password changed property
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Middleware to change deleted account's active status to false
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Middleware to check correct password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Middleware to only select certain user fields
// userSchema.pre(/^find/, function (next) {
//   this.select('role _id name email phone photo');
//   next();
// });

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimeStamp;
  }

  return false;
};

// Create Reset Password Token;

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
