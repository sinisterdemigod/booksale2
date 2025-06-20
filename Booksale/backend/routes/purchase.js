const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Purchase = require('../models/Purchase');
const { authMiddleware } = require('../controllers/authMiddleware');

const router = express.Router();

// Purchase a course
router.post('/:courseId', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  // Check if already purchased
  const user = await User.findById(userId);
  if (user.purchasedCourses.includes(courseId)) {
    return res.status(400).json({ message: 'Course already purchased' });
  }
  user.purchasedCourses.push(courseId);
  await user.save();
  await Purchase.create({ user: userId, course: courseId });
  res.json({ message: 'Course purchased successfully' });
});

// Get purchased courses for user
router.get('/my', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).populate('purchasedCourses');
  res.json(user.purchasedCourses);
});

module.exports = router;
