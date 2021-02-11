const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  productId: [
    {
      type: mongoose.Types.ObjectId,
      ref: "eCommerce",
    },
  ],
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
