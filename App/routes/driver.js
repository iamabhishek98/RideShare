var express = require('express');
var router = express.Router();

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})
const sql = {}
sql.query = {
    //registering
    register: 'INSERT INTO users AdvertisesTrip($1,$2,$3,$4,$5)'
}

/* GET login page. */
router.get('/', function(req, res, next) {
    console.log("driver dashboard");
    res.render('driver', { title: 'Express' });
});
router.post('/advertise', function(req, res, next) {
    var Origin = req.body.Origin;
    var Destination = req.body.Destination;
    var Date = req.body.Date;
    console.log(Origin, Destination, Date);
    
    // pool.query(sql.query.register, [Origin, Destination, "hotspur1997@gmail.com", Date, Date],(err,data) => {
    //     console.log("advertise query success");
    // });
});
module.exports = router;  