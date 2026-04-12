require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();
const dbConnection = require("./database/dbConnection");
const route = require("./route");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
// Middleware for parsing JSON and URL-encoded data
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Use This for session management Start
app.use(
  session({
    secret: "enmoon123",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);
// Use this for session management End

// Database Connection
dbConnection();

// Routing Start
app.use("/user", route);
// Routing End

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
