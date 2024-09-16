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










// async createPaymentIntent(body: any, res: any) {
//   const { amount, email, metadata } = body;

//   const params = JSON.stringify({
//     email,
//     amount,
//     metadata,
//     callback_url: 'http://localhost:5173/',
//   });

//   const options = {
//     hostname: 'api.paystack.co',
//     port: 443,
//     path: '/transaction/initialize',
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//       'Content-Type': 'application/json',
//     },
//   };

//   const reqPaystack = https
//     .request(options, (respaystack) => {
//       let data = '';

//       respaystack.on('data', (chunk) => {
//         data += chunk;
//       });

//       respaystack.on('end', () => {
//         console.log(JSON.parse(data));
//         // Assuming res is the response object from the caller context
//         res.send(data);
//         console.log(data)
//       });
//     })
//     .on('error', (error) => {
//       console.error(error);
//     });

//   reqPaystack.write(params);
//   reqPaystack.end();
// }

// async verifyPayment(reference: string, res: any) {
//   const options = {
//     hostname: 'api.paystack.co',
//     port: 443,
//     path: `/transaction/verify/${reference}`,
//     method: 'GET',
//     headers: {
//       Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//     },
//   };

//   const reqPaystack = https.request(options, (respaystack) => {
//     let data = '';

//     respaystack.on('data', (chunk) => {
//       data += chunk;
//     });

//     respaystack.on('end', async () => {
//       try {
//         const responseData = JSON.parse(data);

//         // Log the entire response from Paystack for debugging

//         if (
//           responseData.status === true

//           // responseData.data.status === 'success'
//         ) {
//           const { customer, id, reference, status, currency, metadata, paidAt } =
//             responseData.data;
//             // console.log(responseData)
//           const totalPrice = parseFloat(metadata.packagePrice);
//           const eightyPercent = totalPrice * 0.8;
//           const twentyPercent = totalPrice * 0.2;
//           console.log(totalPrice, eightyPercent, twentyPercent)

//           const paymentData = {
//             referenceId: reference,
//             email: customer.email,
//             status,
//             currency,
//             name: metadata.fullName,
//             transactionId: id,
//             phone: metadata.phone,
//             userId: metadata.userId,
//             productId: metadata.productId,
//             workExperience: metadata.workExperience,
//             professionalSummary: metadata.professionalSummary,
//             education: metadata.education,
//             skills: metadata.skills,
//             packageTitle: metadata.packageTitle, 
//             packagePrice: metadata.packagePrice,
//             vendorId: metadata.vendorId, 
//             paidAt,
//           };

//           // Save the payment details
//           await this.paymentModel.create(paymentData);

//           // Create or update the wallet balance with the 80% amount
//           let wallet = await this.walletModel.findOne({
//             owner: metadata.vendorId,
//           });
//           if (wallet) {
//             wallet.balance += eightyPercent;
//             await wallet.save();
//           } else {
//             wallet = await this.walletModel.create({
//               owner: metadata.vendorId,
//               balance: eightyPercent,
//             });
//           }


//           const user = await this.userModel.findById(metadata.userId);
//           if (!user) throw new NotFoundException('User not found')

//           const vendor = await this.userModel.findById(metadata.vendorId);
//           if (!user) throw new NotFoundException('User not found')



//           successfulPayment(responseData.data.customer.email, vendor.role, totalPrice, user.name);
//           newOrder(vendor.email, vendor.role, vendor.name)
//           return res.json({
//             status: true,
//             message: 'Payment verified successfully',
//             data: responseData,
//           });

//         } else {
//           // If payment verification failed, log the error and send an error response
//           console.log('Transaction verification failed:', responseData);
//           return res.status(400).json({
//             status: false,
//             message: 'Transaction verification failed.',
//           });
//         }
//       } catch (error) {
//         console.error('Error parsing response:', error);
//         return res.status(500).json({ status: false, message: 'Server error.' });
//       }
//     });
//   });

//   reqPaystack.on('error', (error) => {
//     console.error('Error with Paystack request:', error);
//     res.status(500).json({ status: false, message: 'Server error.' });
//   });

//   reqPaystack.end();
// }