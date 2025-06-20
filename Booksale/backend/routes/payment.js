const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const stripe = Stripe('YOUR_STRIPE_SECRET_KEY'); // Replace with your Stripe secret key

router.post('/create-checkout-session', async (req, res) => {
  const { price, courseId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: `Course Purchase: ${courseId}`,
          },
          unit_amount: price * 100, // Stripe expects amount in paise
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:3000/payment-success',
      cancel_url: 'http://localhost:3000/payment-cancel',
    });
    res.json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
