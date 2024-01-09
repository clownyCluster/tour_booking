const express = require('express');

const router = express.Router();

const {
  aliasCheapTours,
  aliasHotTours,
  getTour,
  createTOur,
  getTourById,
  updateTOur,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
  // checkBody,
} = require('../controller/tourController');

const authController = require('../controller/authController');
const reviewRouter = require('./reviewRoute');

// app.use('/api/v1/tours', router);

// router.param('id', checkId);

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-five-cheap').get(aliasCheapTours, getTour);
router.route('/top-five-hot').get(aliasHotTours, getTour);
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    getMonthlyPlan,
  );

router
  .route('/')
  .get(getTour)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    createTOur,
  );

router
  .route('/:id')
  .get(getTourById)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    updateTOur,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    deleteTour,
  );

module.exports = router;
