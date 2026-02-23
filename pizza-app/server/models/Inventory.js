const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  category: { type: String, enum: ['base', 'sauce', 'cheese', 'veggies', 'meat'], required: true },
  name: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  threshold: { type: Number, required: true, default: 20 }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);
