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
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({ secret: "mysecret", resave: false, saveUninitialized: false })
);
app.all("*", csrfProtection);

app.engine("ejs", ejsMate);

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

app.get("/login", (req, res) => {
  // throw new ExpressError("What is going on!!",412);
  res.render("user/login");
});

app.get("/signup", (req, res) => {
  res.render("user/signup", { csrfToken: req.csrfToken() });
});

app.post("/signup", async (req, res, next) => {});

// * Basic Error Handling Middleware
app.use((err, req, res, next) => {
  const { status, message = "HOLAAA Went There!" } = err;
  // res.status(status).send(message);
  res.render("error", { err});
});

app.listen(port, () => {
  console.log(`Connected Port: ${port}`);
});
