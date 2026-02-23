const inventorySchema = new mongoose.Schema({
  type: String,  // base, sauce, cheese, veggie
  name: String,
  quantity: Number,
  threshold: Number
});
