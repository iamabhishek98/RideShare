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
  //   //   //user_Message
  message:
    "INSERT INTO message (sender_email, receiver_email, msg, msg_time, msg_date) VALUES($1, $2, $3, $4, $5)"
};


var user_email;
/* GET signup page. */
router.get("/", function(req, res, next) {
  console.log("Message page");
  if(req.session.passport.user.email == undefined){
    console.log("user not logged in");
  } else {
    user_email = req.session.passport.user.email;
    console.log(user_email);
  }
  res.render("message", { title: "Express" });
});

// POST
router.post("/basic", function(req, res, next) {
  //Retrieve Information

  var sender = user_email;
  var email = req.body.email;
  var user_Message = req.body.user_Message;
  var d = new Date();
  var date = d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear();
  var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
  console.log(sender, email, user_Message, date, time);
  // var sql =
  //   "insert into message values('" +
  //   sender +
  //   "', '" +
  //   req.body.email +
  //   "', + '" +
  //   req.body.user_Message +
  //   "'+'" +
  //   time +
  //   "', '" +
  //   date +
  //   "' )";

  pool.query(
    sql.query.message,
    [sender, email, user_Message, time, date],
    (err, data) => {
      console.log(data);
    }
  );
  // try {
  //   const data = await pool.query(sql.query.message, [
  //     sender,
  //     email,
  //     user_Message,
  //     time,
  //     date
  //   ]);
  //   console.log("hello");
  //   console.log(data);
  //   console.log(data.rows);
  // } catch {}
  // try {
  //   // Construct Specific SQL Query
  //   pool.query(
  //     sql.query.message,
  //     [sender, email, user_Message, time, date],
  //     (err, data) => {
  //       console.log("sql query success");
  //       console.log(data);
  //     }
  //   );
  // } catch {}

  // pool.query("INSERT INTO message(sender_email, receiver_email,msg,msg_time,msg_date

  // ")
});
module.exports = router;

// sender_email varchar(256) references users(email) not null,
// receiver_email varchar(256) references users(email) not null,
// msg varchar(1024) not null,
// msg_time time,
// msg_date
