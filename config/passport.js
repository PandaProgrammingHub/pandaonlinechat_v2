const GoogleStrategy = require("passport-google-oauth20").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;

const User = require("../models/Users");

module.exports = function (passport) {
  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser((id, cb) => {
    User.findById(id, (err, user) => {
      cb(err, user);
    });
  });
  // GoogleStrategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, cb) => {
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
          loginWith: "google",
        };
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            cb(null, user);
          } else {
            user = await User.create(newUser);
            cb(null, user);
          }
        } catch (error) {
          console.error("GoogleStrategy Error=>", Error);
        }
      }
    )
  );
  // TwitterStrategy
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: "/auth/twitter/callback",
      },
      async (accessToken, refreshToken, profile, cb) => {
        const newUser = {
          twitterId: profile.id,
          displayName: profile.displayName,
          image: profile.photos[0].value,
          loginWith: "twitter",
        };
        try {
          let user = await User.findOne({ twitterId: profile.id });
          if (user) {
            cb(null, user);
          } else {
            user = await User.create(newUser);
            cb(null, user);
          }
        } catch (error) {
          console.error("TwitterStrategy Error=>", Error);
        }
      }
    )
  );
  // GitHubStrategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/auth/github/callback",
      },
      async (accessToken, refreshToken, profile, cb) => {
        const newUser = {
          githubId: profile.id,
          displayName: profile.displayName,
          image: profile.photos[0].value,
          loginWith: "github",
        };
        try {
          let user = await User.findOne({ githubId: profile.id });
          if (user) {
            cb(null, user);
          } else {
            user = await User.create(newUser);
            cb(null, user);
          }
        } catch (error) {
          console.error("GitHubStrategy Error=>", Error);
        }
      }
    )
  );
  //LinkedInStrategy
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_KEY,
        clientSecret: process.env.LINKEDIN_SECRET,
        callbackURL: "/auth/linkedin/callback",
        scope: ["r_emailaddress", "r_liteprofile"],
        state: true,
      },
      async (accessToken, refreshToken, profile, cb) => {
        const newUser = {
          linkedinId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
          loginWith: "linkedin",
        };
        try {
          let user = await User.findOne({ linkedinId: profile.id });
          if (user) {
            cb(null, user);
          } else {
            user = await User.create(newUser);
            cb(null, user);
          }
        } catch (error) {
          console.error("LinkedInStrategy Error=>", Error);
        }
      }
    )
  );
};
