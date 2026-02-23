const pizzaSchema = new mongoose.Schema({
  name: String,
  baseOptions: [String],
  sauceOptions: [String],
  cheeseOptions: [String],
  veggieOptions: [String],
  price: Number
});
