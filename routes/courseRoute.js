const express = require('express');

const router = express.Router();
const courseController = require('../controller/courseController');
const authController = require('../controller/authController');

router
  .route('/')
  .get(authController.protect, courseController.getAllCourse)
  .post(authController.protect, courseController.createCourse);

router
  .route('/:id')
  .patch(authController.protect, courseController.editCourse)
  .delete(authController.protect, courseController.deleteCourse)
  .get(authController.protect, courseController.getSingleCourse);

module.exports = router;
