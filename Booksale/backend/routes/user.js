const express = require('express');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const Course = require('../models/Course');
const { authMiddleware, adminMiddleware } = require('../controllers/authMiddleware');

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('firstName lastName username mobile email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get all purchases for a user (admin only)
router.get('/:userId/purchases', authMiddleware, adminMiddleware, async (req, res) => {
  const purchases = await Purchase.find({ user: req.params.userId }).populate('course');
  res.json(purchases);
});

// Delete a user (admin only)
router.delete('/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return res.status(400).json({ message: 'Cannot delete the only admin user.' });
    }
  }
  await User.findByIdAndDelete(req.params.userId);
  await Purchase.deleteMany({ user: req.params.userId });
  res.json({ message: 'User deleted successfully' });
});

// Toggle admin role (admin only)
router.put('/:userId/toggle-admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent removing admin role if it's the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the only admin user.' });
      }
    }
    
    // Toggle the role
    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();
    
    res.json({ message: 'User role updated successfully', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
});

// Grant/revoke course access for a user (admin only)
router.put('/:userId/courses', authMiddleware, adminMiddleware, async (req, res) => {
  const { courseIds } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.purchasedCourses = courseIds;
  await user.save();
  res.json({ message: 'Course access updated', purchasedCourses: user.purchasedCourses });
});

// Get all accessible courses for a user (admin only)
router.get('/:userId/access-courses', authMiddleware, adminMiddleware, async (req, res) => {
  const user = await User.findById(req.params.userId).populate('purchasedCourses');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.purchasedCourses);
});

// Get all accessible courses for the current user (self)
router.get('/me/access-courses', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).populate('purchasedCourses');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.purchasedCourses);
});

module.exports = router;
