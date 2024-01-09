const express = require('express');

const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');

// const Router = express.Router({ mergeParams: true });

// Router.use(authController.protect);
// Router.route('/')
//   .get(reviewController.getAllReviews)
//   .post(
//     authController.restrictTo('user'),
//     reviewController.setTourIds,
//     reviewController.addReviews,
//   );

// Router.route('/:id')
//   .delete(
//     authController.restrictTo('user', 'admin'),
//     reviewController.deleteReviews,
//   )
//   .get(reviewController.getReviews)
//   .patch(
//     authController.restrictTo('user', 'admin'),
//     reviewController.editReviews,
//   );

// module.exports = Router;

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourIds,
    reviewController.addReviews,
  );

router
  .route('/:id')
  .get(reviewController.getReviews)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.editReviews,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReviews,
  );

module.exports = router;
