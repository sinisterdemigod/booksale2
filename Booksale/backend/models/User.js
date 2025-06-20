const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  firstName: { type: String },
  lastName: { type: String },
  mobile: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
});

module.exports = mongoose.model('User', userSchema);
