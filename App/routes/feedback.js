var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []

sql.query = {
    list_trips: `select distinct P.name as driver, B.email_bidder, B.email_driver, B.e_date, B.e_time, B.start_loc, B.end_loc, B.review, B.rating 
                    from bid B, passenger P
                    where B.e_date is not null
                    and P.email = B.email_driver 
                    and B.email_bidder = $1
                    order by B.e_date desc, B.e_time desc;`
}
var passenger_email;
router.get('/', function(req, res, next){
    passenger_email = req.session.passport.user.email;
    console.log(passenger_email)
    if(req.session.passport == undefined){
        req.redirect('login');
    } else if(req.session.passport.user.id == "passenger"){
        pool.query(sql.query.list_trips, [passenger_email], (err, data) => {
            if (data != undefined) {
                console.log(data.rows)
                res.render('feedback', {
                    list_trips: data.rows
                });
            } else {
                console.log('list of trips data is undefined')
            }
        })
    } else if (req.session.passport.user.id == "driver"){
        res.redirect('driver');
    } else {
        res.redirect('login');
    }
    
})

router.post('/submit_review', function(req, res, next){
    var trip_id = req.body.trip_id;
    var review = req.body.review;
    var rating = req.body.rating;

    console.log(trip_id);
    console.log(review);
    console.log(rating);

    res.redirect('./');
})

module.exports = router;
