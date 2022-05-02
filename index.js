// import modules/packages
const express = require("express");
const dotenv = require("dotenv");
const db = require("./src/models");
const jwt = require("jsonwebtoken");

// routes
const userRoute = require("./src/routes/user.routes");
const loginRoute = require("./src/routes/login.routes");

// initialize app
var app = express();

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
  })
);

// console.log(require("crypto").randomBytes(64).toString("hex"));

// get config variables
dotenv.config();

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

if (process.env.ALLOW_SYNC === "true") {
  db.sequelize
    .sync({ alter: true })
    .then(() =>
      console.log("Done adding/updating the database based on the Models.")
    );
}

// all request will go here first (middleware)
app.use((req, res, next) => {
  // you can check session here
  console.log("Request has been sent to " + req.url);
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to SAS API Demo." });
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // Bearer FDHRECVBDFdfshgdfhbfdhethsdhzdhdfdfabvqvtcywqeiuettiuvewiu
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  // verify if valid ung token
  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    // user.id
    // user.name
    // user.email
    console.log(user, err);
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.use(`${process.env.API_VERSION}/login`, loginRoute);

// needs authentication
app.use(`${process.env.API_VERSION}/user`, authenticateToken, userRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
