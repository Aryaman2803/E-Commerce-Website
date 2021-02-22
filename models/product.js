const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// mongoose.connect("mongodb://localhost:27017/e-commerce", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

const eCommerceSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
});

const eCommerce = mongoose.model("Ecommerce", eCommerceSchema);

module.exports = eCommerce;
