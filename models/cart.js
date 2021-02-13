module.exports = function Cart(oldCart) {
  this.items = oldCart.items || {};
  this.totalQty = oldCart.totalQty || 0;
  this.totalPrice = oldCart.totalPrice || 0;

  this.add = function (item, id) {
    let  storedItem = this.items[id];
    if (!storedItem) {
      storedItem = this.items[id] = { item: item, qty: 0, price: 0 };
    }
    storedItem.qty++;
    storedItem.price = storedItem.item.price * storedItem.qty;
    this.totalQty++;
    this.totalPrice += storedItem.item.price;
  };

  this.generateArray = function () {
    const arr = [];
    for (let id in this.items) {
      arr.push(this.items[id]);
    }
    return arr;
  };
};

// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const cartSchema = new Schema({
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: "User",
//   },
//   items: [
//     {
//       type: mongoose.Types.ObjectId,
//       ref: "eCommerce",
//       qty: {
//         type: Number,
//         default: 1,
//       },
//       // price: {
//       //   type: Number,
//       //   default: 0,
//       // },
//     },
//   ],
// });

// const Cart = mongoose.model("Cart", cartSchema);
// module.exports = Cart;
