const mongoose = require("mongoose");
const eCommerce = require("../models/product");
const { products } = require("./Product");

mongoose.connect("mongodb://localhost:27017/e-commerce", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Database Connected!");
});

const seedProducts = async () => {
  await eCommerce.deleteMany({});
  console.log("Products Removed");

  await eCommerce.insertMany(products);

  console.log("Product Saved!");
};

seedProducts();
