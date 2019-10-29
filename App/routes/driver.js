var express = require('express');
var router = express.Router();

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []
sql.query = {
    advertise: `INSERT INTO advertisesTrip (start_loc, end_loc, email, a_date, a_time) VALUES($1, $2, $3, $4, $5)`   
}

/* GET login page. */
router.get('/', function(req, res, next) {
    console.log("driver dashboard");
    res.render('driver', { title: 'Express' });
});

router.post('/basic', function(req, res, next) {
    console.log('hellloooooooo')
    console.log(req.body)
    var origin = req.body.origin;
    var destination = req.body.destination;
    var email = "rdoog6@yandex.ru";
    var date = req.body.datetime.split("T")[0].split("-")[2]+"/"+req.body.datetime.split("T")[0].split("-")[1]+"/"+req.body.datetime.split("T")[0].split("-")[0]
    var time = req.body.datetime.split("T")[1]+":00";
    try {
        pool.query(sql.query.advertise, [origin, destination, email, date, time], (err, data) => {
            console.log(data)
        })
    } catch {
        console.log('driver basic error')
    }
})

module.exports = router;  