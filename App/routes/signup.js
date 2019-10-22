var express = require('express');
var router = express.Router();

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const bcrypt = require('bcrypt');

/**
 * Enter sql queries in here:
 */

const sql = {}
sql.query = {
    //registering
    register: 'INSERT INTO users VALUES($1,$2,$3,$4)'
}


/* GET signup page. */
router.get('/', function(req, res, next) {
  res.render('signup', { title: 'Express' });
});

// POST
router.post('/', async function(req, res, next){
  //Retrieve Information
  var name = req.body.name;
  var password = req.body.password;
  var email = req.body.email;
  var credit_card = req.body.credit_card;
  var vehicle_num = req.body.vehicleNum;

  try{
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    // Construct Specific SQL Query
	  pool.query(sql.query.register, [email, name, hashedPassword, credit_card],(err, data) => {
		  res.redirect('./login')
	  });
  } catch {
    res.redirect('./signup')
  }
})
module.exports = router;
