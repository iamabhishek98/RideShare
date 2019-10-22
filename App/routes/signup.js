var express = require('express');
var router = express.Router();

const {Pool} = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'dtub2019',
  port: 5432,
})

/* SQL Query */
var sql_query = 'INSERT INTO users VALUES';

/* GET signup page. */
router.get('/', function(req, res, next) {
  res.render('signup', { title: 'Express' });
});

// POST
router.post('/', function(req, res, next){
  //Retrieve Information
  var name = req.body.name;
  var password = req.body.password;
  var email = req.body.email;
  var credit_card = req.body.credit_card;
  var vehicle_num = req.body.vehicleNum;
  console.log(name);
  console.log(password);
  console.log(email);
  console.log(credit_card);
  // Construct Specific SQL Query
	var insert_query = sql_query + "('" + email + "','" + name + "','" + password + "','" +  credit_card+"')";
  
  
	pool.query(insert_query, (err, data) => {
		res.redirect('/login')
	});
})
module.exports = router;
