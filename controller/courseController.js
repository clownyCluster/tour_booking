const factory = require('./handlerFactory');
const Course = require('../models/courseModel');

exports.getAllCourse = factory.findAll(Course);
exports.editCourse = factory.updateOne(Course);
exports.deleteCourse = factory.deleteOne(Course);
exports.getSingleCourse = factory.findOne(Course);
exports.createCourse = factory.createOne(Course);
