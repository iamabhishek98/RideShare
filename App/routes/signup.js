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
    register: 'INSERT INTO passenger VALUES($1,$2,$3,$4)',
    driver: 'insert into driver values($1)',
    insert_vehicle: "insert into vehicles(license_plate, pax) values($1, $2)",
    insert_drives: "insert into drives(email, license_plate) values($1, $2)"
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
  var veh_pax_num = parseInt(req.body.vehPaxNum);


  pool.query(sql.query.check, [email], async (err, data) => {
    console.log("this is the inital data: t ");
    console.log(data);
    if(data.rows.length == 0){
      try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        // Construct Specific SQL Query
        pool.query(sql.query.register, [email, name, hashedPassword, credit_card], async (err, data) => {
          console.log("login query success");
          if(vehicle_num.trim() && veh_pax_num){
            console.log("there is a vehicle number");
            pool.query(sql.query.driver, [email], (err, data) => {
              console.log("Driver account added");
            })
            
            var d1 = await pool.query(sql.query.insert_vehicle, [vehicle_num, veh_pax_num]);
            var d2 = await pool.query(sql.query.insert_drives, [email, vehicle_num]);
          }
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
