const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var socketIo = require("./socket/index");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const passport = require("passport");
const session = require("express-session");
const apiRoute = require("./routes/api");
const route = require("./routes/index");
const authRoute = require("./routes/auth");
const MonogoStore = require("connect-mongo")(session);
const passportSocketIo = require("passport.socketio");
var cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;

const connectDB = require("./config/db");
const { Mongoose } = require("mongoose");

//Load Config
dotenv.config({ path: "./config/config.env" });

// Passport Config
require("./config/passport")(passport);

connectDB();

//Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Handlebars
app.engine(".hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", ".hbs");

//Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    key: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: new MonogoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Static folder
app.use(express.static(path.join(__dirname, "public")));

//bodyParser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Routes
app.use("/", route);
app.use("/api", apiRoute);
app.use("/auth", authRoute);

// Socket Connected
io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    secret: process.env.SESSION_SECRET,
    key: process.env.SESSION_KEY,
    store: new MonogoStore({ mongooseConnection: mongoose.connection }),
  })
);
// Socket Action Call
socketIo(io);

//App Listen
http.listen(port, () =>
  console.log(`Server running on ${process.env.NODE_ENV} mode on port ${port}`)
);
