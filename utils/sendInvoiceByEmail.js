const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sendInvoiceByEmail = require('../utils/sendInvoiceByEmail');
const path = require('path');

// إنشاء الطلب
exports.createOrder = asyncHandler(async (req, res) => {
  const { cartItems, shippingAddress, paymentMethodType } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'Cart items are required' });
  }

  const order = new Order({
    user: req.user._id,
    cartItems,
    shippingAddress,
    paymentMethodType,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// جلب كل الطلبات للمستخدم الحالي
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json(orders);
});

// تحديث حالة الدفع
exports.markOrderAsPaid = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate('cartItems.productModel user');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.isPaid = true;
  order.paidAt = new Date();
  await order.save();

  try {
    await sendInvoiceByEmail(order, {
      storeName: 'TroveeBuy',
      logoPath: path.join(__dirname, '..', 'assets', 'logo.png'),
    });
  } catch (emailErr) {
    console.error('Failed to send invoice:', emailErr);
  }

  res.status(200).json({ message: 'Order marked as paid', order });
});

// Stripe Webhook
exports.stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;

    const order = await Order.findOne({ user: userId, isPaid: false }).sort({ createdAt: -1 }).populate('cartItems.productModel user');

    if (order) {
      order.isPaid = true;
      order.paidAt = new Date();
      await order.save();

      try {
        await sendInvoiceByEmail(order, {
          storeName: 'TroveeBuy',
          logoPath: path.join(__dirname, '..', 'assets', 'logo.png'),
        });
      } catch (emailErr) {
        console.error('Failed to send invoice via webhook:', emailErr);
      }

      console.log(`✅ Order ${order._id} marked as paid`);
    } else {
      console.warn(`⚠️ No unpaid order found for user ${userId}`);
    }
  }

  res.status(200).json({ received: true });
});
