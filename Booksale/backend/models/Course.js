const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  content: { type: String }, // direct text content
  pdfUrl: { type: String },  // URL to uploaded PDF
  videoUrl: { type: String }, // URL to uploaded video
});

module.exports = mongoose.model('Course', courseSchema);
