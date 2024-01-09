const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
  },
  specialization: {
    type: String,
    enum: [
      'Cinematography',
      'Editing',
      'Acting',
      'Direction',
      'Sound',
      'Lighting',
    ],
    required: [true, 'Specialization is required'],
  },
  courseDuration: {
    type: String,
    required: [true, 'Course duration is required'],
  },
  courseFee: {
    type: Number,
    required: [true, 'Course fee is required'],
  },
  college: {
    type: String,
    required: [true, 'College is required'],
  },
  batch: {
    type: String,
  },
  timing: {
    type: String,
    default: '10 am to 4 pm',
  },
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
