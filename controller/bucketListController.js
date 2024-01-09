const BucketList = require('../models/bucketListModel');
const factory = require('./handlerFactory');

// exports.checkId = (req, res, next, val) => {
//   console.log(`This is the id: ${val}`);
//   if (req.params.id * 1 > bucketList.length) {
//     return res.status(404).json({
//       status: 'failed',
//       message: 'Invalid Id',
//     });
//   }
//   next();
// };

exports.searchBucketList = (req, res) => {
  const query = req.query.country;
  const searchedList = BucketList.find((el) => el.country === query);

  if (!searchedList) {
    return res.status(404).send({
      status: 'fail',
      message: 'Country not found in the bucket list.',
    });
  }

  res.status(200).send({
    status: 'success',
    data: {
      searchedList,
    },
  });
};

exports.getBucketList = factory.findAll(BucketList);
exports.createBucketList = factory.createOne(BucketList);
exports.getBucketListById = factory.findOne(BucketList);
exports.updateBucketList = factory.updateOne(BucketList);
exports.deleteBucketList = factory.deleteOne(BucketList);
