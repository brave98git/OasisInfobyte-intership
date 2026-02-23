const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all inventory
router.get('/inventory', protect, admin, async (req, res) => {
    try {
        const items = await Inventory.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add or Update inventory item
router.post('/inventory', protect, admin, async (req, res) => {
    const { category, name, stock, threshold } = req.body;
    try {
        let item = await Inventory.findOne({ name, category });
        if (item) {
            item.stock = stock;
            if (threshold) item.threshold = threshold;
        } else {
            item = new Inventory({ category, name, stock, threshold });
        }
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all orders
router.get('/orders', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order status
router.put('/order/:id/status', protect, admin, async (req, res) => {
    const { status } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        await order.save();

        req.io.emit('orderStatusUpdated', { orderId: order._id, status: order.status, user: order.user });

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
