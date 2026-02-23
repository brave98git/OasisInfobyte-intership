const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    pizzaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza' },
    customPizza: {
      base: { type: String },
      sauce: { type: String },
      cheese: { type: String },
      veggies: [{ type: String }],
      price: { type: Number }
    },
    quantity: { type: Number, required: true, default: 1 }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Order received', 'In the kitchen', 'Sent to delivery', 'Delivered'], default: 'Order received' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  isPaid: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
