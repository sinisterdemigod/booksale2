const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/send', async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hyd05152@gmail.com',
      pass: 'dgnz zksg tbtz qwnl' // Replace with your Gmail App Password
    }
  });

  // Test SMTP connection before sending
  transporter.verify(function(error, success) {
    if (error) {
      console.error('SMTP connection error:', error);
    } else {
      console.log('SMTP server is ready to take messages');
    }
  });

  const mailOptions = {
    from: 'hyd05152@gmail.com',
    to: 'hyd05152@gmail.com',
    subject: `Contact Form Submission from ${name}`,
    text: message + `\n\nSender Email: ${email}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error('Nodemailer error:', err);
    res.status(500).json({ success: false, error: err.message, fullError: err });
  }
});

module.exports = router;
