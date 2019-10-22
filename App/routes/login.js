var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'dtub2019',
  port: 5432,
})

/* GET login page. */
router.get('/', function(req, res, next) {
  console.log("login request");
  res.render('login', { title: 'Express' });
});

var email;
var password;

router.post('/', function(req, res, next){
  email = req.body.email;
  password = req.body.password;
  console.log(email);
  console.log(password);
  /* SQL Query */
  //var sql_query = 'select 1 from users where email = ' + email + ' and password = ' + password + '';
  var sql_query = 'select * from users';
  pool.query(sql_query, (err, data) => {
    console.log(data.rows);
    // if(/**successful match */){
    //   res.redirect('/passenger');
    // } else {
    //   alert("Invalid email or password!");
    // }
  })
});

module.exports = router;
