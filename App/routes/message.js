var express = require("express");
var router = express.Router();

const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "dtub2019",
  port: 5432
});

/* SQL Query */
var sql_query = "INSERT INTO users VALUES";

/* GET message page. */
router.get("/", function(req, res, next) {
  res.render("message", { title: "Express" });
});

// POST
router.post("/", function(req, res, next) {
  //Retrieve Information
  var emailUsername = req.body.emailUsername;
  var text = req.body.text;

  console.log(emailUsername);
  console.log(text);

  // Construct Specific SQL Query
  var insert_query = sql_query + "('" + emailUsername + "','" + text + "')";

  pool.query(insert_query, (err, data) => {
    res.redirect("/login");
  });
});
module.exports = router;
