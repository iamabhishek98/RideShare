// var express = require("express");
// var router = express.Router();

// const { Pool } = require("pg");
// // const pool = new Pool({
// //   user: "postgres",
// //   host: "localhost",
// //   database: "postgres",
// //   password: "password",
// //   port: 5432
// // });
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// /* SQL Query */
// // var sql_query = `INSERT INTO message VALUES("haha@gmail.com", "haha@haha.com", "fk you", "00:00:00", "22/10/2019")`;
// // var sql_query = "select * from users;";
// const sql = {};
// sql.query = {
//   message: `INSERT INTO message VALUES('haha@haha.com', 'haha@gmail.com', 'fk you', '00:00:00', '22/10/2019');`
// };
// /* GET message page. */
// router.get("/", function(req, res, next) {
//   res.render("message", { title: "Express" });
// });

// // POST
// router.post("/basic", function(req, res, next) {
//   //Retrieve Information
//   var emailUsername = req.body.emailUsername;
//   var text = req.body.text;
//   console.log("email" + emailUsername);
//   console.log(text);

//   // Construct Specific SQL Query
//   // var insert_query = sql_query + "('" + emailUsername + "','" + text + "')";

//   pool.query(sql.query.message, (err, data) => {
//     console.log(data);
//   });
// });
// module.exports = router;

var express = require("express");
var router = express.Router();

const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Enter sql queries in here:
 */

const sql = {};
sql.query = {
  //user_Message
  message: "INSERT INTO message VALUES($1, $2, $3, $4, $5)"
};

/* GET signup page. */
router.get("/", function(req, res, next) {
  res.render("message", { title: "Express" });
});

// POST
router.post("/", async function(req, res, next) {
  //Retrieve Information

  var sender = "haha@haha.com";
  var email = req.body.email;
  var user_Message = req.body.user_Message;
  var d = new Date();
  var time = d.getTime();
  var date = d.getDate();

  console.log(sender, email, user_Message, date, time);
  try {
    // Construct Specific SQL Query
    pool.query(
      sql.query.message,
      [sender, email, user_Message, time, date],
      (err, data) => {
        console.log("sql query success");
        console.log(data);
      }
    );
  } catch {}
});
module.exports = router;
