const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pizzaDetails: Object,
  status: {
    type: String,
    enum: ["Order Received", "In Kitchen", "Sent to Delivery"],
    default: "Order Received"
  },
  paymentStatus: String
});
