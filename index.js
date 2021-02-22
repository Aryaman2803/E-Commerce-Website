if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// const dotenv = require("dotenv");

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const port = 3000;
const ejsMate = require("ejs-mate");
const Product = require("./models/product");
const csrf = require("csurf");
const session = require("express-session");
const { Router } = require("express");
const csrfProtection = csrf();
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const passport = require("passport");
const flash = require("connect-flash");
const User = require("./models/user");
const MongoStore = require("connect-mongo")(session);
require("./config/passport");
const Cart = require("./models/cart");
const Order = require("./models/order");
const { isLoggedIn } = require("./middleware");
const { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } = require("constants");
const { Session } = require("inspector");
const stripe = require("stripe")(
  "sk_test_51IL7crIfc54TOuJGE0BGM2BRvwH9uUgX9nKuxxh99Eu4TBgbYrBMbvPQPd7M6rGzF68r3F5xjBHekJElpavRHNRE00OUP20vKC"
);

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/e-commerce";

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Database Connected!!!!");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const secret = process.env.SECRET || "mysecretofcode";
const store = new MongoStore({
  url: dbUrl,
  collection: "usersession",
  secret: secret,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("Session Store Error", e);
});

const sessionConfig = {
  store,
  name: "usersession",
  secret: secret,
  resave: false,
  store: store,
  saveUninitialized: true,

  // store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

app.use(flash());
// app.all("*", csrfProtection);
app.engine("ejs", ejsMate);

app.use(passport.initialize());
app.use(passport.session());

//Our Flash -connect middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  res.locals.cart = req.session.cart;
  res.locals.session = req.session;
  // console.log(res.locals.session.cart);
  next();
});
// function wrapAsync(fn) {
//   return function (req, res, next) {
//     fn(req, res, next).catch((e) => next(e));
//   };
// }

app.get("/index", async (req, res, next) => {
  try {
    const products = await Product.find();
    if (!products) {
      throw next(new ExpressError("Product not found!", 401));
    }
    res.render("shop/index", { products });
  } catch (e) {
    next(e);
  }
});

app.get("/index/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  res.render("shop/show", { product });
  // console.log(req.params.id);
});

app.get("/user/profile", isLoggedIn, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user });
    let cart;
    orders.forEach(function (order) {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render("user/profile", { orders: orders });
  } catch (e) {
    next(e);
  }
});

app.get("/cart", isLoggedIn, (req, res) => {
  if (!req.session.cart) {
    return res.render("shop/cart", { products: null });
  }
  const cart = new Cart(req.session.cart);
  req.session.cart = cart;
  res.render("shop/cart", {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
  });
  // console.log(req.session.cart)
  // console.log(req.params.id);
});

app.get("/clearCart", (req, res) => {
  req.session.cart = null;
  res.redirect("/index");
});

// app.get('/deleteItem/:id',(req,res)=>{
//   console.log(req.params)

//   res.redirect('/index')
// })

app.get("/checkout", (req, res, next) => {
  if (!req.session.cart) {
    return res.render("shop/cart", { products: null });
  }
  const cart = new Cart(req.session.cart);
  res.render("shop/checkout", { totalPrice: cart.totalPrice });
});

app.get("/index/:id/add-to-cart", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.findById(id, function (err, product) {
    if (err) {
      return res.redirect("/index");
    }
    cart.add(product, product._id);
    req.session.cart = cart;
    req.user.cart = cart;

    res.redirect(`/index/${id}`);
  });
});

app.post("/create-checkout-session", isLoggedIn, async (req, res, next) => {
  if (!req.session.cart) {
    return res.render("shop/cart", { products: null });
  }
  const cart = new Cart(req.session.cart);
  const totalPrice = (cart.totalPrice + 150) * 100;
  // req.session.destroy();
  try {
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "IN"],
      },
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Pay",
            },
            unit_amount: totalPrice,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // success_url: "http://localhost:3000/paymentsuccess",
      // success_url: "http://localhost:3000/index",
      success_url: "http://localhost:3000/getpayment_intents",
      cancel_url: "http://localhost:3000/cart",
    });
    res.json({ id: session.id });
  } catch (e) {
    next(e);
  }

  req.session.cart = null;
});

app.get("/getpayment_intents", isLoggedIn, async (req, res, next) => {
  const stripe = require("stripe")(
    "sk_test_51IL7crIfc54TOuJGE0BGM2BRvwH9uUgX9nKuxxh99Eu4TBgbYrBMbvPQPd7M6rGzF68r3F5xjBHekJElpavRHNRE00OUP20vKC"
  );

  const paymentIntents = await stripe.paymentIntents.list({
    limit: 3,
  });
  try {
    const paymentId = paymentIntents.data[0].id;
    const name = paymentIntents.data[0].shipping.name;
    const address = paymentIntents.data[0].shipping.address;
    const user = req.user;

    const order = new Order({
      user: user,
      cart: req.session.cart,
      name: name,
      address: address,
      paymentId: paymentId,
    });

    await order.save();
    req.session.cart = null;

    // console.log(order);
    req.flash("success", "Thank you for shopping!");
    res.redirect("/index");
  } catch (e) {
    next(e);
  }
});

app.get("/user/register", (req, res, next) => {
  res.render("user/register");
});

app.post("/user/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome To Walmart!");
      const redirectUrl = req.session.returnTo || "/index";
      delete req.session.returnTo;
      return res.redirect(redirectUrl);
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
});

app.get("/user/login", (req, res) => {
  // throw new ExpressError("What is going on!!",412);
  res.render("user/login");
});

app.post(
  "/user/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/user/login",
  }),
  (req, res) => {
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    req.flash(
      "success",
      `Welcome, ${capitalizeFirstLetter(req.user.username)}!`
    );
    const redirectUrl = req.session.returnTo || "/index";
    delete req.session.returnTo;
    // console.log(req);
    // console.log(req.session.cart);
    res.redirect(redirectUrl);
  }
);

app.get("/user/logout", (req, res) => {
  // console.log(req.user)
  // req.session.cart.destroy();
  req.logout();
  req.flash("success", "Thank You For Shopping!");
  res.redirect("/index");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found!", 404));
});

// * Basic Error Handling Middleware
app.use((err, req, res, next) => {
  const { statusCode = 404 } = err;
  if (!err.message) err.message = "Oh No!,Something went wrong.";
  res.status(statusCode).render("error", { err });
});

app.listen(port, () => {
  console.log(`Connected Port: ${port}`);
});
