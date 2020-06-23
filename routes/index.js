const express = require("express");
const { model } = require("mongoose");
const router = express.Router();
const { ensureAuth, ensureGuest } = require("../middleware/auth");
// @desc   Login/Landing page
// @route  GET /
router.get("/", ensureGuest, (req, res) => {
  res.render("login", {
    layout: "login",
  });
});

// @desc   Dashboard
// @route  GET /dashboard
router.get("/dashboard", ensureAuth, (req, res) => {
  res.render("dashboard", {
    layout: "dashboard",
    name: req.user.displayName,
    firstName:
      typeof req.user.firstName != "undefined"
        ? req.user.firstName
        : req.user.displayName,
    lastName: req.user.lastName,
    image: req.user.image,
    loginWith: req.user.loginWith,
  });
});
// @desc   Messages
// @route  GET /messgaes
router.get("/messages", ensureAuth, (req, res) => {
  res.render("messgaes", {
    layout: "messages",
    name: req.user.displayName,
    firstName:
      typeof req.user.firstName != "undefined"
        ? req.user.firstName
        : req.user.displayName,
    lastName: req.user.lastName,
    image: req.user.image,
    loginWith: req.user.loginWith,
  });
});
module.exports = router;
