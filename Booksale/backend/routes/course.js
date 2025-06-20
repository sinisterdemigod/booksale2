const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Course = require('../models/Course');
const { authMiddleware, adminMiddleware } = require('../controllers/authMiddleware');

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Get all courses
router.get('/', async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

// Add a new course (admin only)
router.post('/', authMiddleware, adminMiddleware, upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, price, content } = req.body;
    let pdfUrl = '', videoUrl = '';
    if (req.files['pdf']) {
      pdfUrl = `/uploads/${req.files['pdf'][0].filename}`;
    }
    if (req.files['video']) {
      videoUrl = `/uploads/${req.files['video'][0].filename}`;
    }
    const course = new Course({ title, description, price, content, pdfUrl, videoUrl });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add course', error: err.message });
  }
});

// Edit a course (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { title, description, price, content } = req.body;
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { title, description, price, content },
    { new: true }
  );
  res.json(course);
});

// Delete a course (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: 'Course deleted' });
});

// Download PDF file
router.get('/download/pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// Get course details by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course details', error: error.message });
  }
});

module.exports = router;
