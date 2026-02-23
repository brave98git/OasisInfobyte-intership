const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');
const { sendAdminThresholdAlert } = require('../utils/emailHelpers');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create', protect, async (req, res) => {
    try {
        const { items, totalAmount } = req.body;

        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`
        };

        const razorpayOrder = await razorpay.orders.create(options);

        const newOrder = new Order({
            user: req.user._id,
            items,
            totalAmount,
            razorpayOrderId: razorpayOrder.id,
        });

        await newOrder.save();

        res.json({ order: newOrder, razorpayOrder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/verify-payment', protect, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.isPaid = true;
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.status = 'Order received';
        await order.save();

        const lowStockItems = [];
        for (let orderItem of order.items) {
            const customPizza = orderItem.customPizza;
            if (customPizza) {
                const ingredientsToDeduct = [customPizza.base, customPizza.sauce, customPizza.cheese, ...customPizza.veggies];

                for (let ingName of ingredientsToDeduct) {
                    if (!ingName) continue;
                    const invItem = await Inventory.findOne({ name: ingName });
                    if (invItem) {
                        invItem.stock -= orderItem.quantity;
                        await invItem.save();

                        if (invItem.stock <= invItem.threshold) {
                            lowStockItems.push(invItem);
                        }
                    }
                }
            }
        }

        if (lowStockItems.length > 0) {
            try {
                if (process.env.ADMIN_EMAIL && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                    await sendAdminThresholdAlert(process.env.ADMIN_EMAIL, lowStockItems);
                }
            } catch (e) { console.log('Email alert failed:', e.message); }
        }

        req.io.emit('newOrderReceived', order);

        res.json({ message: "Payment verified successfully", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/my-orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
