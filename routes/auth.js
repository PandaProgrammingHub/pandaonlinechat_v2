const express = require("express");
const passport = require("passport");
const router = express.Router();

// @desc   Auth with Google
// @route  GET /auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

// @desc   Google auth callback
// @route  GET /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// @desc   Auth with Twitter
// @route  GET /auth/twitter
router.get("/twitter", passport.authenticate("twitter"));

// @desc   Twitter auth callback
// @route  GET /auth/twitter/callback
router.get(
  "/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// @desc   Auth with Github
// @route  GET /auth/github
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// @desc   Github auth callback
// @route  GET /auth/github/callback
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// @desc   Auth with Linkedin
// @route  GET /auth/linkedin
router.get("/linkedin", passport.authenticate("linkedin"));

// @desc   Linkedin auth callback
// @route  GET /auth/linkedin/callback
router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// @desc   Logout User
// @route  GET /auth/logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
