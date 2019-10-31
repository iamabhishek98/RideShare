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
    check: 'select * from passenger where email = $1',
    register: 'INSERT INTO passenger VALUES($1,$2,$3,$4)'
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

  pool.query(sql.query.check, [email], async (err, data) => {
    console.log("this is the inital data: t ");
    console.log(data);
    if(data.rows.length == 0){
      try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        // Construct Specific SQL Query
        pool.query(sql.query.register, [email, name, hashedPassword, credit_card],(err, data) => {
          console.log("login query success");
          res.redirect('./login')
        });
      } catch {
        res.redirect('./signup')
      }
    } else {
      console.log("This user already exists");
      res.redirect('./login');
    }
  })

})

module.exports = router;
