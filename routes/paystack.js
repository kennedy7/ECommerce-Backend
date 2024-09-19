const express = require("express");
const PaystackRouter = express.Router();
const User = require("../models/user");
require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const Order = require("../models/order");
const { transporter } = require("../utils/nodemailerConfig");

// Paystack secret key 
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Initialize Paystack transaction and create an order
PaystackRouter.post("/api/paystack/pay", async (req, res) => {
  const { email, amount, address, userId, products } = req.body;

  try {
    // Step 1: Initialize Paystack transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Paystack requires amount in kobo
        metadata: {
          userId,
          address,
          products,
        },
        callback_url: "http://localhost:5173/",
        // callback_url: "https://powermartelectricals.com/",
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
      paymentStatus: "pending", // Initial payment status
      deliveryStatus: "pending", // Initial delivery status
    });

    await newOrder.save();

    // Step 3: Send the Paystack payment link to the frontend
    res.status(200).json({ authorization_url, reference });
  } catch (error) {
    console.error("Error initializing payment:", error);
    res.status(500).json({ message: "Payment initialization failed" });
  }
});

// Handle Paystack webhook
PaystackRouter.post(
  "/api/paystack/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const secret = PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash === req.headers["x-paystack-signature"]) {
      const event = req.body;
      const data = event.data;

      try {
        if (event.event === "charge.success") {
          // Find the order using the Paystack reference
          const order = await Order.findOne({ reference: data.reference });

          if (order) {
            // Update order with successful payment information
            order.paymentStatus = "paid";
            order.deliveryStatus = "pending";
            order.metadata = { ...order.metadata, ...data.metadata };

            await order.save();
            // Send confirmation email after successful payment
            await sendOrderConfirmationEmail(order.userId, order);

            console.log("Payment successful and email sent:", event);
          }
        }
      } catch (err) {
        console.error("Order update failed:", err);
      }
    } else {
      res.status(400).send("Invalid signature");
    }
    res.status(200).send();
  }
);

// Verify Paystack transaction
PaystackRouter.get("/api/paystack/verify/:reference", async (req, res) => {
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

    if (transaction.status === "success") {
      // Step 2: Update the order status in the database
      const order = await Order.findOne({ reference });

      if (order) {
        order.paymentStatus = "paid";
        order.deliveryStatus = "pending";
        order.metadata = { ...order.metadata, ...transaction.metadata };
        await order.save();

        return res.status(200).json({ message: "Payment verified", order });
      }
    } else {
      return res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

// Function to send order confirmation email
async function sendOrderConfirmationEmail(userId, order) {
  try {
    // Retrieve the user based on userId
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
      return;
    }

    // Mail options
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL,
      subject: "Order Confirmation",
      html: `
      <p>Dear ${user.name},</p>
      <p>Your order with reference <strong>${order.reference}</strong> has been confirmed and successfully placed.</p>
      <p>We will notify you once your order is shipped.</p>
      <p>Thank you for shopping with us!</p>
    `,
    };
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
}

module.exports = PaystackRouter;
