const express = require('express');

const bucketListController = require('../controller/bucketListController');

const router = express.Router();

// router.param('id', bucketListController.checkId);

router
  .route('/')
  .get(bucketListController.getBucketList)
  .post(bucketListController.createBucketList);

router.route('/search').get(bucketListController.searchBucketList);

router
  .route('/:id')
  .patch(bucketListController.updateBucketList)
  .delete(bucketListController.deleteBucketList)
  .get(bucketListController.getBucketListById);

module.exports = router;
