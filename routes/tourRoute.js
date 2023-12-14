const express = require('express');
const router = express.Router();

const {
  getTour,
  createTOur,
  getTourById,
  updateTOur,
  deleteTour,
  aliasCheapTours,
  aliasHotTours,
  getTourStats,
  getMonthlyPlan,
  // checkBody,
} = require('../controller/tourController');

// app.use('/api/v1/tours', router);

// router.param('id', checkId);

router.route('/top-five-cheap').get(aliasCheapTours, getTour);
router.route('/top-five-hot').get(aliasHotTours, getTour);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(getTour).post(createTOur);

router.route('/:id').get(getTourById).patch(updateTOur).delete(deleteTour);

module.exports = router;
