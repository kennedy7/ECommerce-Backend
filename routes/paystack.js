const express = require('express');
const PaystackRouter = express.Router();
const axios = require('axios');

// Replace with your secret key from Paystack
const PAYSTACK_SECRET_KEY = 'your-secret-key';

// Initialize Paystack transaction
PaystackRouter.post('/paystack/pay', async (req, res) => {
  const { email, amount } = req.body;

  try {
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email,
      amount: amount * 100, // Convert to kobo
    }, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const { authorization_url, reference } = response.data.data;
    res.status(200).json({ authorization_url, reference });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
});

PaystackRouter.post('/paystack/webhook', (req, res) => {
    const secret = PAYSTACK_SECRET_KEY;
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  
    if (hash === req.headers['x-paystack-signature']) {
      // Process the event here
      const event = req.body;
      console.log('Payment successful:', event);
    }
  
    res.status(200).send();
  });
  PaystackRouter.get('/paystack/verify/:reference', async (req, res) => {
    const reference = req.params.reference;
  
    try {
      const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });
  
      const transaction = response.data.data;
      if (transaction.status === 'success') {
        res.status(200).json({ message: 'Payment verified', transaction });
      } else {
        res.status(400).json({ message: 'Payment verification failed' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Payment verification failed' });
    }
  });
    

module.exports = PaystackRouter;
