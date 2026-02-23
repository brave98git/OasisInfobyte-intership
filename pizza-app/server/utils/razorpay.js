const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "YOUR_TEST_KEY",
  key_secret: "YOUR_TEST_SECRET"
});


const order = await razorpay.orders.create({
  amount: 50000,
  currency: "INR"
});


await Inventory.updateOne(
  { name: selectedBase },
  { $inc: { quantity: -1 } }
);


cron.schedule("*/10 * * * *", async () => {
  const lowStock = await Inventory.find({
    $expr: { $lt: ["$quantity", "$threshold"] }
  });

  if(lowStock.length > 0){
    sendEmail(adminEmail, "Low Stock Alert");
  }
});

io.emit("statusUpdated", order);
socket.on("statusUpdated", (data)=>{
  updateUI(data);
});
