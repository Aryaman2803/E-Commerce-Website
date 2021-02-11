const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const product = require("./product");
const passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost:27017/e-commerce", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  cart: {
    type: Schema.Types.ObjectId,
    ref: "Cart",
  },
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
