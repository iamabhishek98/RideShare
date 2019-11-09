var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []

sql.query = {
    list_trips: `select distinct P.name as driver, B.email_bidder, B.email_driver, B.s_date, B.s_time, B.e_date, B.e_time, B.start_loc, B.end_loc, B.review, B.rating 
                    from bid B, passenger P
                    where B.e_date is not null
                    and P.email = B.email_driver 
                    and B.email_bidder = $1
                    order by B.e_date desc, B.e_time desc;`,
    insert_feedback: `update bid set review = $1, rating = $2 where s_date = $3 and s_time = $4 
                        and email_bidder = $5 and email_driver = $6 and start_loc = $7 and is_win is true and e_date is not null;`,
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
                    list_trips: data.rows,
                    user_name: req.session.passport.user.name
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

router.post('/submit_review', async function(req, res, next){
    var id = req.body.trip_id;
    var trip_id = id - 1;
    var review = req.body.review;
    var rating = req.body.rating;
    console.log(trip_id);
    console.log(review);
    console.log(rating);

    var trip;
    var list_trips = await pool.query(sql.query.list_trips, [passenger_email]);
    if (list_trips != undefined) {
        console.log(list_trips.rows)
        trip = list_trips.rows[trip_id]
    } else {
        console.log('list of trips data is undefined')
    }

    if (trip != undefined) {
        s_date = trip.s_date
        s_time = trip.s_time
        email_driver = trip.email_driver
        start_loc = trip.start_loc
        var insert_feedback = await pool.query(sql.query.insert_feedback, [review, rating, s_date, s_time, passenger_email, email_driver, start_loc])
        if (insert_feedback != undefined) {
            console.log(insert_feedback)
        } else {
            console.log('insert feedback data is undefined')
        }
    }

    res.redirect('./');
})

module.exports = router;
