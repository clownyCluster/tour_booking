const mongoose = require('mongoose');

const bucketListSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  activity: String,
  priority: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  budget: {
    type: String,
    required: true,
  },
  recommended: {
    type: Boolean,
    default: true,
  },
});

// const bucketListSchema = new mongoose.Schema({
//   bucketList: [bucketListItemSchema],
// });

const BucketList = mongoose.model('BucketList', bucketListSchema);

module.exports = BucketList;
