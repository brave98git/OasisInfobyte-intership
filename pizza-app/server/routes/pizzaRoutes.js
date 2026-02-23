const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/authMiddleware');

router.get('/ingredients', protect, async (req, res) => {
    try {
        const items = await Inventory.find({ stock: { $gt: 0 } });

        const categorized = {
            base: items.filter(i => i.category === 'base'),
            sauce: items.filter(i => i.category === 'sauce'),
            cheese: items.filter(i => i.category === 'cheese'),
            veggies: items.filter(i => i.category === 'veggies'),
            meat: items.filter(i => i.category === 'meat')
        };

        res.json(categorized);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
