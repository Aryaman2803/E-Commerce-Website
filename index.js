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

require("./config/passport");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({ secret: "mysecret", resave: false, saveUninitialized: true })
);

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

app.get("/user/login", (req, res) => {
  // throw new ExpressError("What is going on!!",412);
  res.render("user/login");
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
      return res.redirect("/index");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
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
