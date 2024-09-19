const express = require("express");
const PaystackRouter = express.Router();
require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const Order = require("../models/order");

// Paystack secret key
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Initialize Paystack transaction and create an order
PaystackRouter.post('/paystack/pay', async (req, res) => {
  const { email, amount, address, userId, products } = req.body;

  try {
    // Step 1: Initialize Paystack transaction
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Paystack requires amount in kobo
        metadata: {
          userId,
          address,
          products,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { authorization_url, reference } = response.data.data;

    // Step 2: Create a new order with returned reference, userId, and plain products array
    const newOrder = new Order({
      userId,
      reference,
      products,
      amount,
      address,
      paymentStatus: 'pending', // Initial payment status
      deliveryStatus: 'pending', // Initial delivery status
    });

    await newOrder.save();

    // Step 3: Send the Paystack payment link to the frontend
    res.status(200).json({ authorization_url, reference });
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
});

// Handle Paystack webhook
PaystackRouter.post('/paystack/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = PAYSTACK_SECRET_KEY;
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash === req.headers['x-paystack-signature']) {
    const event = req.body;
    const data = event.data;

    try {
      if (event.event === 'charge.success') {
        // Find the order using the Paystack reference
        const order = await Order.findOne({ reference: data.reference });

        if (order) {
          // Update order with successful payment information
          order.paymentStatus = 'paid';
          order.deliveryStatus = 'pending'; // Adjust as needed based on your process
          order.metadata = { ...order.metadata, ...data.metadata };

          await order.save();
          console.log('Payment successful:', event);
        }
      }
    } catch (err) {
      console.error('Order update failed:', err);
    }
  } else {
    res.status(400).send('Invalid signature');
  }

  res.status(200).send();
});

// Verify Paystack transaction
PaystackRouter.get('/paystack/verify/:reference', async (req, res) => {
  const reference = req.params.reference;

  try {
    // Step 1: Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const transaction = response.data.data;

    if (transaction.status === 'success') {
      // Step 2: Update the order status in the database
      const order = await Order.findOne({ reference });

      if (order) {
        order.paymentStatus = 'paid';
        order.deliveryStatus = 'pending'; 
        order.metadata = { ...order.metadata, ...transaction.metadata };

        await order.save();
        return res.status(200).json({ message: 'Payment verified', order });
      }
    } else {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

module.exports = PaystackRouter;
