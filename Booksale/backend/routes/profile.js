const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authMiddleware } = require('../controllers/authMiddleware');

const router = express.Router();

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Update current user profile
router.put('/me', authMiddleware, async (req, res) => {
  const { firstName, lastName, mobile, email, password } = req.body;
  const update = { firstName, lastName, mobile, email };
  if (password) {
    update.password = await bcrypt.hash(password, 10);
  }
  const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true, select: '-password' });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

module.exports = router;
