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



















// const express = require('express');
// const PaystackRouter = express.Router();
// const axios = require('axios');

// // Replace with your secret key from Paystack
// const PAYSTACK_SECRET_KEY = 'your-secret-key';

// // Initialize Paystack transaction
// PaystackRouter.post('/paystack/pay', async (req, res) => {
//   const { email, amount } = req.body;

//   try {
//     const response = await axios.post('https://api.paystack.co/transaction/initialize', {
//       email,
//       amount: amount * 100, // Convert to kobo
//     }, {
//       headers: {
//         Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//       },
//     });

//     const { authorization_url, reference } = response.data.data;
//     res.status(200).json({ authorization_url, reference });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Payment initialization failed' });
//   }
// });

// PaystackRouter.post('/paystack/webhook', (req, res) => {
//     const secret = PAYSTACK_SECRET_KEY;
//     const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  
//     if (hash === req.headers['x-paystack-signature']) {
//       // Process the event here
//       const event = req.body;
//       console.log('Payment successful:', event);
//     }
  
//     res.status(200).send();
//   });

// PaystackRouter.get('/paystack/verify/:reference', async (req, res) => {
//     const reference = req.params.reference;
  
//     try {
//       const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//         },
//       });
  
//       const transaction = response.data.data;
//       if (transaction.status === 'success') {
//         res.status(200).json({ message: 'Payment verified', transaction });
//       } else {
//         res.status(400).json({ message: 'Payment verification failed' });
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Payment verification failed' });
//     }
//   });
    

// module.exports = PaystackRouter;







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


// router.post("/payment", function (req, res) {
//   const { amount, email, metadata } = req.body;

//   const params = JSON.stringify({
//     email,
//     amount,
//     // callback_url: "https://yoamart.com/",
//     callback_url: "http://localhost:5173/",

//     metadata,
//   });

//   // console.log(params);

//   const options = {
//     hostname: "api.paystack.co",
//     port: 443,
//     path: "/transaction/initialize",
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//       "Content-Type": "application/json",
//     },
//   };

//   const reqPaystack = https
//     .request(options, (respaystack) => {
//       let data = "";

//       respaystack.on("data", (chunk) => {
//         data += chunk;
//       });

//       respaystack.on("end", () => {
//         res.send(data);
//         console.log(JSON.parse(data));
//       });
//     })
//     .on("error", (error) => {
//       console.error(error);
//     });

//   reqPaystack.write(params);
//   reqPaystack.end();
// });

// router.post("/verify", async function (req, res) { // Corrected function async syntax
//   const reference = req.query.reference;
//   // console.log(reference);
//   const options = {
//     hostname: "api.paystack.co",
//     port: 443,
//     path: `/transaction/verify/${reference}`,
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//     },
//   };

//   const reqPaystack = https
//     .request(options, async (respaystack) => { // Mark the callback function as async
//       let data = "";

//       respaystack.on("data", (chunk) => {
//         data += chunk;
//       });

//       respaystack.on("end", async () => { // Mark the callback function as async
//         const responseData = JSON.parse(data);
//         // console.log(responseData); // Log the response for debugging purposes

//         // Check if payment was successful
//         if (
//           responseData.status === true &&
//           responseData.data.status === "success"
//         ) {
//           // Payment was successful, extract relevant information
//           const { customer, id, reference, status, currency, metadata } = responseData.data;

//           const paymentData = {
//             referenceId: reference,
//             email: customer.email,
//             status,
//             currency,
//             name: metadata.customerName,
//             transactionId: id,
//             phone: metadata.phone,
//             address: metadata.deliveryAddress,
//             totalPrice: metadata.totalPrice,
//             cart: metadata.cart,
//             userId: metadata.customerId
//           };

//           console.log(paymentData);

//           // Correct the property name from "refrenceId" to "referenceId" in the Order instantiation
//           const order = new Order({
//             referenceId: reference, // Corrected property name
//             email: paymentData.email,
//             name: paymentData.name,
//             userId: paymentData.userId,
//             currency,
//             mobile: paymentData.phone,
//             address: paymentData.address,
//             total: paymentData.totalPrice,
//             cart: paymentData.cart,
//             transactionId: paymentData.transactionId,
//             status,
//           });

//           await order.save();

//           const shipping = new Shipping({
//             orderId: order._id,
//             name: paymentData.name,
//             email: paymentData.email,
//             address: paymentData.address,
//             phone: paymentData.phone
//           });

//           await shipping.save();

//           const productList = paymentData.cart.map(item => {
//             return `Product: ${item.name}, Price: ${item.totalPrice} Quantity: ${item.quantity}`;
//           })

//           const aggregatedProducts = {};
//           paymentData.cart.forEach(product => {
//             const productName = product.name;
//             if (aggregatedProducts[productName]) {
//               aggregatedProducts[productName].quantity += product.quantity;
//               aggregatedProducts[productName].totalPrice += product.totalPrice;
//             } else {
//               aggregatedProducts[productName] = {
//                 quantity: product.quantity,
//                 totalPrice: product.totalPrice
//               };
//             }
//           });

//           // Send email for each product with aggregated data
//           Object.keys(aggregatedProducts).forEach(productName => {
//             const product = aggregatedProducts[productName];
//             productOrderMail(
//               paymentData.name,
//               paymentData.email,
//               productName,
//               product.quantity,
//               product.price,
//               paymentData.address,
//               paymentData.transactionId
//             );
//           });


//           // productOrderMail({name: paymentData.name, email: paymentData.email, product: metadata.cart.name, quantity: metadata.cart.quantity,
//           // image:metadata.cart.image, price: paymentData.totalPrice, address: paymentData.address, transactionId: paymentData.transactionId })

//           // Find the product based on some criteria (e.g., product ID)
//           const cart = metadata.cart;

//           for (const cartItem of cart) {
//             const productId = cartItem.id;
//             const product = await Product.findById(productId);

//             if (!product) {
//               return res.status(422).json({ message: `Cannot display product with ID: ${productId}!` });
//             } else {
//               // Update the quantity of the product
//               const purchaseQuantity = parseInt(cartItem.quantity, 10); // Ensure quantity is a number
//               product.quantity -= purchaseQuantity;

//               // Update the top selling field of the product
//               product.topSelling = Math.max(product.topSelling, purchaseQuantity);

//               // Update the inStock status
//               if (product.quantity <= 0) {
//                 product.inStock = false;
//               }

//               // Save the updated product instance
//               await product.save();
//             }
//           }

//           // After iterating through all products, you can return a success response
//           res.status(200).json({
//             message: "Cart processed successfully!",
//             paymentData: paymentData,
//           });
//         }

//         // console.log(JSON.parse(data));
//       });
//     })
//     .on("error", (error) => {
//       console.error(error);
//     });
//   reqPaystack.end();
// });


